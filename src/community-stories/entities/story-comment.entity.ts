import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Story } from './story.entity';

@Entity('story_comments')
export class StoryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'story_id', type: 'uuid' })
  storyId: string;

  @ManyToOne(() => Story)
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'author_name', type: 'varchar', length: 100, default: 'Traveler' })
  authorName: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
