import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from './review.entity'
import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByAttraction(attractionId: string) {
    return this.repo.find({
      where: { attractionId },
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<Review>) {
    const review = this.repo.create(data);
    return this.repo.save(review);
  }
  
      private reviewRepo: Repository<Review>,
  ) {}

  async create(dto: CreateReviewDto, userId?: string) {
    const result = await this.reviewRepo.manager.query(
      `INSERT INTO reviews (attraction_id, user_id, rating, comment, author_name, title)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, rating, comment, author_name, title, created_at`,
      [
        dto.attraction_id,
        userId || null,
        dto.rating,
        dto.comment,
        dto.author_name || 'Anonymous',
        dto.title || null,
      ],
    )
    return result[0]
  }
}
