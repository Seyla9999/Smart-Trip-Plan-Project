import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AttractionImagesService } from './attraction-images.service';

@Controller('attraction-images')
export class AttractionImagesController {
  constructor(private readonly service: AttractionImagesService) {}

  // GET /attraction-images/slug/:slug
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findByAttractionSlug(slug);
  }

  // GET /attraction-images?attractionId=uuid
  @Get()
  findByAttractionId(@Query('attractionId') attractionId: string) {
    if (!attractionId) return [];
    return this.service.findByAttractionId(attractionId);
  }

  // POST /attraction-images  (save Supabase Storage URL to DB)
  @Post()
  addImage(
    @Body() body: {
      attractionSlug?: string;
      attractionId?: string;
      url: string;
      fileType?: string;
    },
  ) {
    return this.service.addImage(body);
  }
}
