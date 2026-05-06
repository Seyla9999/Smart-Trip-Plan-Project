import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attractions')
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'province_id', type: 'int' })
  provinceId: number;

  @Column({ name: 'name_en', type: 'varchar' })
  nameEn: string;

  @Column({ name: 'name_kh', type: 'varchar', nullable: true })
  nameKh: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'geometry', nullable: true })
  location: string;

  @Column({ name: 'is_hidden_gem', type: 'boolean', default: false })
  isHiddenGem: boolean;

  @Column({ name: 'average_rating', type: 'decimal', default: 0 })
  averageRating: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}