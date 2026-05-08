import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attraction } from '../attractions/entities/attraction.entity';

@Injectable()
export class AttractionImagesService {
  constructor(
    @InjectRepository(Attraction)
    private attractionRepo: Repository<Attraction>,
  ) {}

  // Get images from attachments table for an attraction (by UUID or slug)
  async findByAttractionSlug(slug: string): Promise<any[]> {
    const nameEn = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const rows = await this.attractionRepo.manager.query(
      `SELECT a.id, a.url, a.file_type, a.created_at
       FROM attachments a
       JOIN attractions att ON att.id = a.entity_id
       WHERE a.entity_type = 'attraction'
         AND att.name_en ILIKE $1
       ORDER BY a.created_at ASC`,
      [`%${nameEn}%`],
    );
    return rows;
  }

  async findByAttractionId(attractionId: string): Promise<any[]> {
    const rows = await this.attractionRepo.manager.query(
      `SELECT id, url, file_type, created_at
       FROM attachments
       WHERE entity_type = 'attraction' AND entity_id = $1
       ORDER BY created_at ASC`,
      [attractionId],
    );
    return rows;
  }

  async addImage(dto: {
    attractionSlug?: string;
    attractionId?: string;
    url: string;
    fileType?: string;
  }): Promise<any> {
    let attractionId = dto.attractionId;

    if (!attractionId && dto.attractionSlug) {
      const nameEn = dto.attractionSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const rows = await this.attractionRepo.manager.query(
        `SELECT id FROM attractions WHERE name_en ILIKE $1 LIMIT 1`,
        [`%${nameEn}%`],
      );
      if (rows.length > 0) attractionId = rows[0].id;
    }

    if (!attractionId) return null;

    const rows = await this.attractionRepo.manager.query(
      `INSERT INTO attachments (url, file_type, entity_type, entity_id)
       VALUES ($1, $2, 'attraction', $3)
       RETURNING id, url, file_type, entity_id, created_at`,
      [dto.url, dto.fileType ?? 'image', attractionId],
    );
    return rows[0];
  }
}
