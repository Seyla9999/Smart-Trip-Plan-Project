import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

type BookmarkRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  created_at: Date;
};

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepo: Repository<Bookmark>,
  ) {}

  async create(userId: string, dto: CreateBookmarkDto): Promise<BookmarkRow> {
    const existing = (await this.bookmarkRepo.manager.query(
      `SELECT id, entity_type, entity_id, created_at
       FROM bookmarks
       WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3
       LIMIT 1`,
      [userId, dto.entity_type, dto.entity_id],
    )) as unknown as BookmarkRow[];

    if (existing.length > 0) {
      return existing[0];
    }

    const result = (await this.bookmarkRepo.manager.query(
      `INSERT INTO bookmarks (user_id, entity_type, entity_id)
       VALUES ($1, $2, $3)
       RETURNING id, entity_type, entity_id, created_at`,
      [userId, dto.entity_type, dto.entity_id],
    )) as unknown as BookmarkRow[];

    return result[0];
  }

  async getUserBookmarks(userId: string): Promise<BookmarkRow[]> {
    return this.bookmarkRepo.manager.query(
      `SELECT id, entity_type, entity_id, created_at
       FROM bookmarks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  async removeBookmark(userId: string, bookmarkId: string): Promise<void> {
    await this.bookmarkRepo.manager.query(
      `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2`,
      [bookmarkId, userId],
    );
  }
}
