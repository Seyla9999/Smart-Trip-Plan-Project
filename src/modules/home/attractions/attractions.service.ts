import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attraction } from './attraction.entity';

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attraction)
    private repo: Repository<Attraction>,
    private dataSource: DataSource,
  ) {}
  async findAll(q: {
    category?: string;
    province?: string;
    province_id?: number;
    is_hidden_gem?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const limit = Number(q.limit) || 20;
    const page  = Number(q.page)  || 1;

    // ✅ Use raw SQL to include review_count in one query
    let sql = `
      SELECT
        a.id,
        a.province_id,
        a.name_en,
        a.name_kh,
        a.category,
        a.description,
        a.is_hidden_gem,
        a.average_rating,
        a.created_at,
        a.updated_at,
        COUNT(r.id)::int AS review_count,
        json_build_object(
          'id',             p.id,
          'name_en',        p.name_en,
          'name_kh',        p.name_kh,
          'main_image_url', p.main_image_url
        ) AS province
      FROM attractions a
      LEFT JOIN provinces p  ON p.id  = a.province_id
      LEFT JOIN reviews   r  ON r.attraction_id = a.id
      WHERE a.deleted_at IS NULL
    `;

    const params: any[] = [];
    let   idx           = 1;

    if (q.category)    { sql += ` AND a.category = $${idx++}`;              params.push(q.category); }
    if (q.province_id) { sql += ` AND a.province_id = $${idx++}`;           params.push(Number(q.province_id)); }
    if (q.province)    { sql += ` AND p.name_en ILIKE $${idx++}`;           params.push(`%${q.province}%`); }
    if (q.search)      { sql += ` AND (a.name_en ILIKE $${idx} OR a.name_kh ILIKE $${idx++})`; params.push(`%${q.search}%`); }
    if (q.is_hidden_gem === 'true') { sql += ` AND a.is_hidden_gem = true`; }

    sql += ` GROUP BY a.id, p.id ORDER BY a.average_rating DESC`;

    const countSql   = `SELECT COUNT(*) FROM (${sql}) AS sub`;
    const countResult = await this.dataSource.query(countSql, params);
    const total       = parseInt(countResult[0].count, 10);

    sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, (page - 1) * limit);

    const data = await this.dataSource.query(sql, params);

    return { success: true, data, meta: { total, page, limit } };
  }

  async findHiddenGems(limit = 5) {
    const sql = `
      SELECT
        a.id,
        a.province_id,
        a.name_en,
        a.name_kh,
        a.category,
        a.description,
        a.is_hidden_gem,
        a.average_rating,
        COUNT(r.id)::int AS review_count,
        json_build_object(
          'id',             p.id,
          'name_en',        p.name_en,
          'name_kh',        p.name_kh,
          'main_image_url', p.main_image_url
        ) AS province
      FROM attractions a
      LEFT JOIN provinces p ON p.id = a.province_id
      LEFT JOIN reviews   r ON r.attraction_id = a.id
      WHERE a.deleted_at IS NULL
        AND a.is_hidden_gem = true
      GROUP BY a.id, p.id
      ORDER BY a.average_rating DESC
      LIMIT $1
    `;
    const data = await this.dataSource.query(sql, [limit]);
    return { success: true, data };
  }

  async findOne(id: string) {
    const sql = `
      SELECT
        a.*,
        COUNT(r.id)::int AS review_count,
        ROUND(AVG(r.rating)::numeric, 1) AS computed_rating,
        json_build_object(
          'id',             p.id,
          'name_en',        p.name_en,
          'name_kh',        p.name_kh,
          'description',    p.description,
          'main_image_url', p.main_image_url
        ) AS province,
        COALESCE(
          json_agg(
            json_build_object(
              'id',      r.id,
              'rating',  r.rating,
              'comment', r.comment
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS reviews
      FROM attractions a
      LEFT JOIN provinces p ON p.id = a.province_id
      LEFT JOIN reviews   r ON r.attraction_id = a.id
      WHERE a.id = $1
        AND a.deleted_at IS NULL
      GROUP BY a.id, p.id
    `;
    const rows = await this.dataSource.query(sql, [id]);
    if (!rows.length) return { success: false, message: 'Attraction not found' };
    return { success: true, data: rows[0] };
  }
}