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
    const existing = await this.bookmarkRepo.manager.query(
      `SELECT id, entity_type, entity_id, created_at
       FROM bookmarks
       WHERE user_id = $1 AND entity_id = $2
       LIMIT 1`,
      [userId, dto.entity_id],
    )
    if (existing.length > 0) return existing[0]

    const result = await this.bookmarkRepo.manager.query(
      `INSERT INTO bookmarks (user_id, entity_type, entity_id)
       VALUES ($1, $2, $3)
       RETURNING id, entity_type, entity_id, created_at`,
      [userId, dto.entity_type, dto.entity_id],
    )
    return result[0]
  }

  async getUserBookmarks(userId: string) {
    return this.bookmarkRepo.manager.query(
      `SELECT id, entity_type, entity_id, created_at
       FROM bookmarks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    )
  }

  async removeBookmark(userId: string, bookmarkId: string) {
    return this.bookmarkRepo.manager.query(
      `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2`,
      [bookmarkId, userId],
    )
  }
}
