import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly service: StoriesService) {}

  // GET /stories?limit=5
  @Get()
  findAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ limit, page, status });
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
