import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async findByAttractionName(name: string): Promise<Review[]> {
    // Resolve attraction name → UUID, then return reviews
    const result = await this.reviewRepo.manager.query(
      `SELECT r.* FROM reviews r
       JOIN attractions a ON a.id = r.attraction_id
       WHERE a.name_en ILIKE $1
       ORDER BY r.created_at DESC`,
      [`%${name}%`],
    );
    return result;
  }

  async findByAttractionId(attractionId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { attractionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAttractionSlug(slug: string): Promise<Review[]> {
    // Convert slug like "tatai-waterfall" → "Tatai Waterfall"
    const nameEn = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return this.findByAttractionName(nameEn);
  }

  async create(dto: {
    attractionSlug?: string;
    attractionId?: string;
    rating: number;
    comment: string;
    authorName: string;
    title?: string;
    userId?: string;
  }): Promise<Review> {
    let attractionId = dto.attractionId;

    if (!attractionId && dto.attractionSlug) {
      const nameEn = dto.attractionSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const rows = await this.reviewRepo.manager.query(
        `SELECT id FROM attractions WHERE name_en ILIKE $1 LIMIT 1`,
        [`%${nameEn}%`],
      );
      if (rows.length > 0) attractionId = rows[0].id;
    }

    const data: DeepPartial<Review> = {
      attractionId,
      userId: dto.userId ?? undefined,
      rating: dto.rating,
      comment: dto.comment,
      authorName: dto.authorName || 'Anonymous',
      title: dto.title ?? undefined,
    };

    const review = this.reviewRepo.create(data);
    const saved = await this.reviewRepo.save(review) as Review;

    // Update average_rating on the attraction
    if (attractionId) {
      await this.reviewRepo.manager.query(
        `UPDATE attractions
         SET average_rating = (
           SELECT ROUND(AVG(rating)::numeric, 2)
           FROM reviews
           WHERE attraction_id = $1 AND rating IS NOT NULL
         )
         WHERE id = $1`,
        [attractionId],
      );
    }

    return saved;
  }

  async getStats(attractionId: string): Promise<{ average: number; total: number }> {
    const rows = await this.reviewRepo.manager.query(
      `SELECT ROUND(AVG(rating)::numeric, 2) as average, COUNT(*) as total
       FROM reviews WHERE attraction_id = $1`,
      [attractionId],
    );
    return {
      average: parseFloat(rows[0]?.average ?? '0'),
      total: parseInt(rows[0]?.total ?? '0', 10),
    };
  }
}
