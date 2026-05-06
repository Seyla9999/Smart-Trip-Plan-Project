import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews/attraction/:slug
  @Get('attraction/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.reviewsService.findByAttractionSlug(slug);
  }

  // GET /reviews?attractionId=uuid
  @Get()
  getAll(@Query('attractionId') attractionId: string) {
    if (attractionId) {
      return this.reviewsService.findByAttractionId(attractionId);
    }
    return [];
  }

  // POST /reviews
  @Post()
  create(
    @Body()
    body: {
      attractionSlug?: string;
      attractionId?: string;
      rating: number;
      comment: string;
      authorName: string;
      title?: string;
    },
  ) {
    return this.reviewsService.create(body);
  }
}
