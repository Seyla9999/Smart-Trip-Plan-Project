import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { NearbyImagesService } from './nearby-images.service';

@Controller('nearby-images')
export class NearbyImagesController {
  constructor(private readonly nearbyImagesService: NearbyImagesService) {}

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.nearbyImagesService.findBySlug(slug);
    return { data };
  }

  @Post()
  async addImage(@Body() body: { place_slug: string; image_url: string }) {
    if (!body.place_slug || !body.image_url) {
      throw new BadRequestException('place_slug and image_url are required');
    }
    return this.nearbyImagesService.addImage(body.place_slug, body.image_url);
  }
}
