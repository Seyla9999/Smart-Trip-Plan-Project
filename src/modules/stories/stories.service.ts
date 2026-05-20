import { Injectable } from '@nestjs/common';
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

  async findAll(q: { limit?: number; page?: number }) {
    const limit = Number(q.limit) || 10;
    const page  = Number(q.page)  || 1;
    const skip  = (page - 1) * limit;

    const data = await this.dataSource.query(
      `
      SELECT
        s.id,
        s.title,
        s.content,
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
      WHERE s.deleted_at IS NULL
        AND s.status = 'approved'
      GROUP BY s.id, u.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, skip],
    );

    const total = await this.storyRepo.count({
      where: { status: 'approved' },
    });

    return { success: true, data, meta: { total, page, limit } };
  }
}