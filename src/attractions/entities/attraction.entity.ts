import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Province } from '../../provinces/entities/province.entity';

@Entity('attractions')
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'province_id', type: 'int' })
  provinceId: number;

  @ManyToOne(() => Province, (province) => province.attractions)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Column({ name: 'name_en', type: 'varchar' })
  nameEn: string;

  // ✅ Specify type explicitly
  @Column({ name: 'name_kh', type: 'varchar', nullable: true })
  nameKh: string;

  // ✅ Specify type explicitly
  @Column({ type: 'varchar', nullable: true })
  category: string;

  // ✅ Specify type explicitly
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_hidden_gem', type: 'boolean', default: false })
  isHiddenGem: boolean;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  get name(): string {
    return this.nameEn;
  }

  get rating(): number {
    return Number(this.averageRating);
  }

  get badges(): string[] {
    const badges: string[] = [];
    if (this.isHiddenGem) badges.push('HIDDEN GEM');
    if (this.category) badges.push(this.category.toUpperCase());
    if (Number(this.averageRating) >= 4.5) badges.push('TOP RATED');
    return badges;
  }

  get tags(): string[] {
    const tags: string[] = [];
    if (this.category) tags.push(this.category);
    return tags;
  }

  get about(): string[] {
    return this.description ? this.description.split('\n\n') : [];
  }
}
