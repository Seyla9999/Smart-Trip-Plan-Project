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
    if (
      !normalized.length ||
      normalized.includes('all') ||
      normalized.includes('*')
    ) {
      return null;
    }
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
    const userId = q.userId;
    const category = q.category;
    const sort = q.sort || 'latest';
    const search = q.search;

    const queryBuilder = this.storyRepo
      .createQueryBuilder('s')
      .where('s.deletedAt IS NULL');

    if (statusFilter) {
      queryBuilder.andWhere('s.status IN (:...statuses)', {
        statuses: statusFilter,
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
        '(s.title ILIKE :q OR s.content ILIKE :q OR s.location ILIKE :q OR s.authorName ILIKE :q)',
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

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

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
