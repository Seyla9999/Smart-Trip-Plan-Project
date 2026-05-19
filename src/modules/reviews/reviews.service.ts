import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from './review.entity'
import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
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
