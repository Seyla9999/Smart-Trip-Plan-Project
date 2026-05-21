import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  getByUser(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.bookmarksService.findByUser(userId).then((data) => ({ data }));
  }

  @Post()
  create(
    @Body()
    body: {
      userId: string;
      place_id: string;
      place_name?: string;
      place_type?: string;
      place_image_url?: string;
    },
  ) {
    if (!body.userId || !body.place_id) {
      throw new BadRequestException('userId and place_id are required');
    }
    return this.bookmarksService.create({
      userId: body.userId,
      placeId: body.place_id,
      placeName: body.place_name,
      placeType: body.place_type,
      placeImageUrl: body.place_image_url,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.bookmarksService.remove(id, userId);
  }
}
