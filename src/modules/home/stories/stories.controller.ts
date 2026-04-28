// ============================================================
// SAVE AS: src/modules/home/stories/stories.controller.ts
// ============================================================
import { Controller, Get, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly service: StoriesService) {}

  // GET /stories?limit=5
  @Get()
  findAll(@Query('limit') limit?: number, @Query('page') page?: number) {
    return this.service.findAll({ limit, page });
  }
}
