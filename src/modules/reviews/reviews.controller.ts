import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll() {
    const data = await this.reviewsService.findAll();
    return { success: true, data };
  }

  @Get('attraction/:id')
  async findByAttraction(@Param('id') id: string) {
    const data = await this.reviewsService.findByAttraction(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    const data = await this.reviewsService.create(dto, req.user?.id);
    return { success: true, data };
  }
}
