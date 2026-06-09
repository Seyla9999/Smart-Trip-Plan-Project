import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CommunityStoriesService } from '../../community-stories/community-stories.service';

@Controller('stories')
export class StoriesController {
  constructor(
    private readonly service: StoriesService,
    private readonly communityStoriesService: CommunityStoriesService,
  ) {}

  // GET /stories
  @Get()
  findAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      limit,
      page,
      status,
      userId,
      category,
      sort,
      search,
    });
  }

  // GET /stories/stats
  @Get('stats')
  getStats() {
    return this.communityStoriesService.getStats();
  }

  // POST /stories
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
      videoUrl?: string;
      authorName: string;
      authorHandle: string;
      authorInitials: string;
      authorAvatarColor?: string;
      authorHomeBase?: string;
    },
  ) {
    return this.communityStoriesService.create(body);
  }

  // GET /stories/:id/comments
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.communityStoriesService.getComments(id);
  }

  // POST /stories/:id/comments
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { authorName: string; body: string },
  ) {
    return this.communityStoriesService.addComment(id, body);
  }

  // POST /stories/:id/like  (increment)
  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.communityStoriesService.toggleLike(id, true);
  }

  // DELETE /stories/:id/like  (decrement)
  @Delete(':id/like')
  unlike(@Param('id') id: string) {
    return this.communityStoriesService.toggleLike(id, false);
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
