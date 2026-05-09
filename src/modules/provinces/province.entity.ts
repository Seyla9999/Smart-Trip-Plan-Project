import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Attraction } from '../attractions/attraction.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_en: string;

  @Column()
  name_kh: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  main_image_url: string;

  @OneToMany(() => Attraction, (attraction) => attraction.province)
  attractions: Attraction[];

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
