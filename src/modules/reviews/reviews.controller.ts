import { Controller, Post, Get, Body, UseGuards, Request, Param, ForbiddenException } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TripsService } from '../trips/trips.service'

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly tripsService: TripsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    const userId = req.user?.id
    if (userId && dto.attraction_id) {
      const allowed = await this.tripsService.canReview(dto.attraction_id, userId)
      if (!allowed) {
        throw new ForbiddenException('Complete a trip that includes this attraction before leaving a review')
      }
    }
    return this.reviewsService.create(dto, userId)
  }

  @Get()
  async findAll() {
    return this.reviewsService.findAll()
  }

  @Get('attraction/:id')
  async findByAttraction(@Param('id') id: string) {
    return this.reviewsService.findByAttraction(id)
  }
}
