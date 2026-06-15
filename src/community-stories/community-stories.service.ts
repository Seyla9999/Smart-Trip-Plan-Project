import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Story } from './entities/story.entity';
import { StoryComment } from './entities/story-comment.entity';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class CommunityStoriesService {
  constructor(
    @InjectRepository(Story)
    private storyRepo: Repository<Story>,
    @InjectRepository(StoryComment)
    private commentRepo: Repository<StoryComment>,
    private usersService: UsersService,
  ) {}

  async findAll(query: {
    category?: string;
    sort?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: Story[]; total: number }> {
    const { category, sort = 'latest', search, limit = 20, page = 1 } = query;

    const qb = this.storyRepo
      .createQueryBuilder('story')
      .where('story.deletedAt IS NULL')
      .andWhere("story.status IN ('published', 'approved')");

    if (category && category !== 'All') {
      qb.andWhere('story.category = :category', { category });
    }

    if (search) {
      qb.andWhere(
        '(story.title ILIKE :q OR story.content ILIKE :q OR story.location ILIKE :q OR story.authorName ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    if (sort === 'popular') {
      qb.orderBy('story.likesCount', 'DESC');
    } else if (sort === 'discussed') {
      qb.orderBy('story.commentsCount', 'DESC');
    } else if (sort === 'top-rated') {
      qb.orderBy('story.rating', 'DESC');
    } else {
      qb.orderBy('story.publishedAt', 'DESC');
    }

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(dto: {
    title: string;
    content: string;
    category: string;
    location?: string;
    rating?: number;
    imageUrls?: string[];
    videoUrl?: string;
    authorName: string;
    authorHandle: string;
    authorInitials: string;
    authorAvatarColor?: string;
    authorAvatarUrl?: string;
    authorHomeBase?: string;
    userId?: string;
  }): Promise<Story> {
    let authorName = dto.authorName ?? 'Traveler';
    let authorHandle = dto.authorHandle ?? '@traveler';
    let authorInitials = dto.authorInitials ?? 'T';
    let authorAvatarColor = dto.authorAvatarColor ?? '#1a2340';
    let authorAvatarUrl = dto.authorAvatarUrl;
    let authorHomeBase = dto.authorHomeBase ?? '';

    // If userId is provided, fetch actual user data
    if (dto.userId) {
      const user = await this.usersService.findById(dto.userId);
      if (user) {
        authorName = user.full_name || authorName;
        authorHandle = user.username ? `@${user.username}` : authorHandle;
        authorAvatarUrl = user.avatar_url || authorAvatarUrl;
        
        // Generate initials from full name
        const names = user.full_name?.trim().split(/\s+/) || [];
        if (names.length > 0) {
          authorInitials = names
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join('')
            .substring(0, 5);
        }
      }
    }

    const data: DeepPartial<Story> = {
      title: dto.title,
      content: dto.content,
      category: dto.category,
      location: dto.location ?? 'Cambodia',
      rating: dto.rating,
      imageUrls: dto.imageUrls,
      videoUrl: dto.videoUrl,
      likesCount: 0,
      commentsCount: 0,
      authorName,
      authorHandle,
      authorInitials,
      authorAvatarColor,
      authorAvatarUrl,
      authorHomeBase,
      userId: dto.userId,
      status: 'pending',
      publishedAt: new Date(),
    };

    const story = this.storyRepo.create(data);
    return this.storyRepo.save(story);
  }

  async toggleLike(
    id: string,
    increment: boolean,
  ): Promise<{ likesCount: number }> {
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Story not found');

    story.likesCount = Math.max(0, story.likesCount + (increment ? 1 : -1));
    await this.storyRepo.save(story);
    return { likesCount: story.likesCount };
  }

  async getComments(storyId: string): Promise<StoryComment[]> {
    return this.commentRepo.find({
      where: { storyId },
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(
    storyId: string,
    dto: { authorName: string; body: string; userId?: string },
  ): Promise<StoryComment> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story not found');

    let authorName = dto.authorName ?? 'Traveler';

    // If userId is provided, fetch actual user data
    if (dto.userId) {
      const user = await this.usersService.findById(dto.userId);
      if (user) {
        authorName = user.full_name || authorName;
      }
    }

    const data: DeepPartial<StoryComment> = {
      storyId,
      authorName,
      body: dto.body,
      userId: dto.userId,
    };

    const comment = this.commentRepo.create(data);
    const saved = await this.commentRepo.save(comment);

    story.commentsCount += 1;
    await this.storyRepo.save(story);

    return saved;
  }

  async getStats(): Promise<{ totalStories: number; totalLikes: number }> {
    const rows = await this.storyRepo.manager.query(
      `SELECT COUNT(*) as total, SUM(likes_count) as likes
       FROM stories WHERE status IN ('published', 'approved') AND deleted_at IS NULL`,
    );
    return {
      totalStories: parseInt(rows[0]?.total ?? '0', 10),
      totalLikes: parseInt(rows[0]?.likes ?? '0', 10),
    };
  }
}
