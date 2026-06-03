import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

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

  async create(dto: CreateReviewDto, userId?: string) {
    const review: DeepPartial<Review> = {
      attractionId: dto.attraction_id,
      userId: userId ?? undefined,
      rating: dto.rating,
      comment: dto.comment,
      authorName: dto.author_name || 'Anonymous',
      title: dto.title ?? undefined,
    };
    return this.reviewRepo.save(review);
  }
}
