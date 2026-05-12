import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepo: Repository<Bookmark>,
  ) {}

  async findByUser(userId: string): Promise<Bookmark[]> {
    return this.bookmarkRepo.find({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: {
    userId: string;
    placeId: string;
    placeName?: string;
    placeType?: string;
    placeImageUrl?: string;
  }): Promise<Bookmark> {
    // Return existing if already bookmarked
    const existing = await this.bookmarkRepo.findOne({
      where: { userId: dto.userId, placeId: dto.placeId },
    });
    if (existing) {
      existing.status = 'active';
      return this.bookmarkRepo.save(existing);
    }

    const data: DeepPartial<Bookmark> = {
      userId: dto.userId,
      placeId: dto.placeId,
      placeName: dto.placeName ?? undefined,
      placeType: dto.placeType ?? undefined,
      placeImageUrl: dto.placeImageUrl ?? undefined,
      status: 'active',
    };

    const bookmark = this.bookmarkRepo.create(data);
    return this.bookmarkRepo.save(bookmark) as Promise<Bookmark>;
  }

  async remove(bookmarkId: string, userId: string): Promise<{ success: boolean }> {
    await this.bookmarkRepo.delete({ id: bookmarkId, userId });
    return { success: true };
  }
}
