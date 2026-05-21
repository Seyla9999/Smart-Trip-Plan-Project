import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepo: Repository<Bookmark>,
  ) {}

  async create(userId: string, dto: CreateBookmarkDto) {
    const existingBookmark = await this.bookmarkRepo.findOne({
      where: { user_id: userId, place_id: dto.place_id },
    });

    if (existingBookmark) {
      throw new Error('Place already bookmarked');
    }

    const bookmark = this.bookmarkRepo.create({
      user_id: userId,
      ...dto,
    });

    return this.bookmarkRepo.save(bookmark);
  }

  async getUserBookmarks(userId: string, status: string = 'active') {
    return this.bookmarkRepo.find({
      where: { user_id: userId, status },
      order: { created_at: 'DESC' },
    });
  }

  async removeBookmark(userId: string, bookmarkId: string) {
    return this.bookmarkRepo.delete({
      id: bookmarkId,
      user_id: userId,
    });
  }

  async archiveBookmark(userId: string, bookmarkId: string) {
    return this.bookmarkRepo.update(
      { id: bookmarkId, user_id: userId },
      { status: 'archived' },
    );
  }
}
