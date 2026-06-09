import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityStoriesController } from './community-stories.controller';
import { CommunityStoriesService } from './community-stories.service';
import { Story } from './entities/story.entity';
import { StoryComment } from './entities/story-comment.entity';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryComment]), UsersModule],
  controllers: [CommunityStoriesController],
  providers: [CommunityStoriesService],
  exports: [CommunityStoriesService],
})
export class CommunityStoriesModule {}
