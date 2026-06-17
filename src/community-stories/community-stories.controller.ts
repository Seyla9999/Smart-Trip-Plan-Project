import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { CommunityStoriesService } from './community-stories.service';

@Controller('community')
export class CommunityStoriesController {
  constructor(private readonly service: CommunityStoriesService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.service.findAll({
      category,
      sort,
      search,
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1,
    });
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  // POST /community
  @Post()
  create(
    @Body()
    body: {
      title: string;
      content: string;
      category: string;
      location?: string;
      rating?: number;
      imageUrl?: string;
      imageUrls?: string[];
      videoUrl?: string;
      userId?: string;
    },
  ) {
    return this.service.create(body);
  }

  // GET /community/:id/comments
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.service.getComments(id);
  }

  // POST /community/:id/comments
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { body: string; userId?: string },
  ) {
    return this.service.addComment(id, body);
  }

  // POST /community/:id/like  (increment)
  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.service.toggleLike(id, true);
  }

  // DELETE /community/:id/like  (decrement)
  @Delete(':id/like')
  unlike(@Param('id') id: string) {
    return this.service.toggleLike(id, false);
  }
}
