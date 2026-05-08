import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'place_id', type: 'varchar', length: 255 })
  placeId: string;

  @Column({ name: 'place_name', type: 'varchar', length: 255, nullable: true })
  placeName: string;

  @Column({ name: 'place_type', type: 'varchar', length: 100, nullable: true })
  placeType: string;

  @Column({ name: 'place_image_url', type: 'text', nullable: true })
  placeImageUrl: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
