import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', default: 'published' })
  status: string;

  @Column({ type: 'varchar', length: 50, default: 'Natural' })
  category: string;

  @Column({ type: 'varchar', length: 100, default: 'Cambodia' })
  location: string;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl: string;

  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'integer', default: 0 })
  commentsCount: number;

  @Column({
    name: 'author_name',
    type: 'varchar',
    length: 100,
    default: 'Traveler',
  })
  authorName: string;

  @Column({
    name: 'author_handle',
    type: 'varchar',
    length: 100,
    default: '@traveler',
  })
  authorHandle: string;

  @Column({ name: 'author_initials', type: 'varchar', length: 5, default: 'T' })
  authorInitials: string;

  @Column({
    name: 'author_avatar_color',
    type: 'varchar',
    length: 20,
    default: '#1a2340',
  })
  authorAvatarColor: string;

  @Column({
    name: 'author_home_base',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  authorHomeBase: string;

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'NOW()' })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
