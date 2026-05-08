import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nearby_images')
export class NearbyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'place_slug', type: 'varchar', length: 255 })
  placeSlug: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
