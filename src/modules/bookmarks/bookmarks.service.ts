import { Injectable, ConflictException } from '@nestjs/common';
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
      where: {
        user_id: userId,
        entity_type: dto.entity_type,
        entity_id: dto.entity_id,
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Already bookmarked');
    }

    const bookmark = this.bookmarkRepo.create({
      user_id: userId,
      entity_type: dto.entity_type,
      entity_id: dto.entity_id,
    });

    return this.bookmarkRepo.save(bookmark);
  }

  async getUserBookmarks(userId: string) {
    return this.bookmarkRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async removeBookmark(userId: string, bookmarkId: string) {
    return this.bookmarkRepo.delete({
      id: bookmarkId,
      user_id: userId,
    });
  }
}
