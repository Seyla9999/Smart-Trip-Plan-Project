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

  async findAll(q: { limit?: number; page?: number; status?: string }) {
    const limit = Number(q.limit) || 10;
    const page = Number(q.page) || 1;
    const skip = (page - 1) * limit;
    const statusFilter = this.parseStatusFilter(q.status);

    const params: Array<number | string[]> = [limit, skip];
    const statusClause = statusFilter ? ' AND s.status = ANY($3)' : '';
    if (statusFilter) {
      params.push(statusFilter);
    }

    const data = await this.dataSource.query(
      `
      SELECT
        s.id,
        s.title,
        s.content,
        s.status,
        s.category,
        s.location,
        s.image_url,
        s.likes_count,
        s.comments_count,
        s.author_name,
        s.author_handle,
        s.published_at,
        s.created_at,
        u.id          AS user_id,
        u.full_name   AS user_name,
        u.avatar_url  AS user_avatar,
        u.username    AS user_username,
        COALESCE(
          json_agg(
            json_build_object('url', att.url, 'file_type', att.file_type)
          ) FILTER (WHERE att.id IS NOT NULL),
          '[]'
        ) AS attachments
      FROM stories s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN attachments att
        ON att.entity_id::uuid = s.id
        AND att.entity_type = 'story'
      WHERE s.deleted_at IS NULL${statusClause}
      GROUP BY s.id, u.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      params,
    );

    const countQuery = this.storyRepo
      .createQueryBuilder('s')
      .where('s.deleted_at IS NULL');

    if (statusFilter) {
      countQuery.andWhere('s.status IN (:...statuses)', {
        statuses: statusFilter,
      });
    }

    const total = await countQuery.getCount();

    return { success: true, data, meta: { total, page, limit } };
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
    if (!story || story.deleted_at) {
      throw new NotFoundException('Story not found');
    }

    story.status = normalizedStatus;
    story.updated_at = new Date();
    await this.storyRepo.save(story);

    return {
      id: story.id,
      status: story.status,
      updated_at: story.updated_at,
    };
  }
}
