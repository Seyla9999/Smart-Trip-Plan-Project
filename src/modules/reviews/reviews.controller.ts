import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(dto, req.user?.id)
    
  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, data };
  }

  @Get('attraction/:id')
  async findByAttraction(@Param('id') id: string) {
    const data = await this.service.findByAttraction(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { success: true, data };
  }
}
