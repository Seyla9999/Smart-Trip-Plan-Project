import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stories')
export class StoriesController {
  constructor(private readonly service: StoriesService) {}

  // GET /stories?limit=5
  @Get()
  findAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.findAll({ limit, page, status, userId });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const data = await this.service.updateStatus(id, body.status);
    return { success: true, data };
  }
}
