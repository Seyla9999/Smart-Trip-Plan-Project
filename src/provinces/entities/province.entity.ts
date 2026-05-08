import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Attraction } from '../../attractions/entities/attraction.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_en', type: 'varchar' })
  nameEn: string;

  @Column({ name: 'name_kh', type: 'varchar' })
  nameKh: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'main_image_url', type: 'text', nullable: true })
  mainImageUrl: string;

  @Column({ name: 'center_location', type: 'geometry', nullable: true })
  centerLocation: string;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;
  
  @OneToMany(() => Attraction, (attraction) => attraction.province)
  attractions: Attraction[];
}
