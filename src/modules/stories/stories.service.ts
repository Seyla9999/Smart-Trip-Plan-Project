import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Story } from './story.entity';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storyRepo: Repository<Story>,
    private dataSource: DataSource,
  ) {}

  private parseStatusFilter(status?: string): string[] | null {
    if (!status) return null;
    const normalized = status
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (!normalized.length) return null;
    if (normalized.includes('all') || normalized.includes('*')) return [];
    return normalized;
  }

  async findAll(q: {
    limit?: number;
    page?: number;
    status?: string;
    userId?: string;
    category?: string;
    sort?: string;
    search?: string;
  }) {
    const limit = Number(q.limit) || 10;
    const page = Number(q.page) || 1;
    const skip = (page - 1) * limit;
    const statusFilter = this.parseStatusFilter(q.status);
    const statuses = statusFilter === null ? ['published', 'approved'] : statusFilter;
    const userId = q.userId;
    const category = q.category;
    const sort = q.sort || 'latest';
    const search = q.search;

    const queryBuilder = this.storyRepo
      .createQueryBuilder('s')
      .where('s.deletedAt IS NULL')
      .leftJoin('users', 'u', 'u.id = s.userId')
      .addSelect(['u.id', 'u.full_name', 'u.avatar_url', 'u.email']);

    if (statuses.length) {
      queryBuilder.andWhere('s.status IN (:...statuses)', {
        statuses,
      });
    }

    if (userId) {
      queryBuilder.andWhere('s.userId = :userId', { userId });
    }

    if (category && category !== 'All') {
      queryBuilder.andWhere('s.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        '(s.title ILIKE :q OR s.content ILIKE :q OR s.location ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    if (sort === 'popular') {
      queryBuilder.orderBy('s.likesCount', 'DESC');
    } else if (sort === 'discussed') {
      queryBuilder.orderBy('s.commentsCount', 'DESC');
    } else if (sort === 'top-rated') {
      queryBuilder.orderBy('s.rating', 'DESC');
    } else {
      queryBuilder.orderBy('s.createdAt', 'DESC');
    }

    // get total before applying pagination
    const total = await queryBuilder.getCount();

    const result = await queryBuilder.take(limit).skip(skip).getRawAndEntities();
    const stories = result.entities as Story[];
    const rawRows = result.raw as any[];

    const data = stories.map((story, index) => {
      const raw = rawRows[index] as Record<string, any> | undefined;
      // prefer raw image_url (single varchar from Supabase) when present,
      // otherwise fall back to entity `imageUrl` (single string)
      const imageArray = raw && raw.s_image_url
        ? [raw.s_image_url]
        : story.imageUrl
        ? [story.imageUrl]
        : [];

      return {
        ...story,
        imageUrls: imageArray,
        image_url: imageArray,
        imageUrl: Array.isArray(imageArray) ? imageArray[0] ?? null : imageArray,
        user: raw && raw.u_id
          ? {
              id: raw.u_id,
              name: raw.u_full_name,
              avatar_url: raw.u_avatar_url,
              email: raw.u_email,
            }
          : null,
      };
    });

    return { success: true, data, total, meta: { total, page, limit } };
  }

  private normalizeStatus(status?: string): string {
    if (!status) return 'pending';
    const normalized = status.toString().trim().toLowerCase();
    if (normalized === 'published') return 'approved';
    return normalized;
  }

  async updateStatus(id: string, status: string) {
    const normalizedStatus = this.normalizeStatus(status);
    if (
      !['pending', 'approved', 'flagged', 'reported', 'rejected'].includes(
        normalizedStatus,
      )
    ) {
      throw new BadRequestException(
        'Status must be pending, approved, flagged, reported, or rejected',
      );
    }

    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story || story.deletedAt) {
      throw new NotFoundException('Story not found');
    }

    story.status = normalizedStatus;
    story.updatedAt = new Date();
    await this.storyRepo.save(story);

    return {
      id: story.id,
      status: story.status,
      updatedAt: story.updatedAt,
    };
  }
}
