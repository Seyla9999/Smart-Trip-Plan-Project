import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBookmark(@Request() req, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserBookmarks(@Request() req) {
    return this.bookmarksService.getUserBookmarks(req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeBookmark(@Request() req, @Param('id') bookmarkId: string) {
    return this.bookmarksService.removeBookmark(req.user.id, bookmarkId);
  }
}
