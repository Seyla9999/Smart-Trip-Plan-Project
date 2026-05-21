import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

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
}
