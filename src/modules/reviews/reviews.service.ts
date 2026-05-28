import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from './review.entity'
import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  findAll() {
    return this.reviewRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByAttraction(attractionId: string) {
    return this.reviewRepo.find({
      where: { attractionId },
      order: { createdAt: 'DESC' },
    });
  }

  create(dto: CreateReviewDto, userId?: string) {
    const review = this.reviewRepo.create({
      attractionId: dto.attraction_id,
      rating: dto.rating,
      comment: dto.comment,
      authorName: dto.author_name ?? 'Anonymous',
      title: dto.title ?? null,
      userId: userId ?? null,
    } as any)

    return this.reviewRepo.save(review)
  }
}
