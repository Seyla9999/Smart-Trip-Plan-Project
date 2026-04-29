import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_en', type: 'varchar' })
  nameEn: string;

  @Column({ name: 'name_kh', type: 'varchar' })
  nameKh: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'main_image_url', type: 'text', nullable: true })
  mainImageUrl: string;

  @Column({ name: 'center_location', type: 'geometry', nullable: true })
  centerLocation: string;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;
}