import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Province } from '../provinces/province.entity';

@Entity('attractions')
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  province_id: number;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Column()
  name_en: string;

  @Column({ nullable: true })
  name_kh: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  // is_hidden_gem = true → this attraction appears in the Hidden Gems section
  @Column({ default: false })
  is_hidden_gem: boolean;

  @Column({ type: 'decimal', default: 0 })
  average_rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // soft delete: deleted_at is NOT NULL means it is deleted (won't show in results)
  @DeleteDateColumn()
  deleted_at: Date;
}
