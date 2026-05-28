import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(dto, req.user?.id)
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
