import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story } from './story.entity';
import { CommunityStoriesModule } from '../../community-stories/community-stories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story]),
    CommunityStoriesModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
