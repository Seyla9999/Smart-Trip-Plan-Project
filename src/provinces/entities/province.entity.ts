import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Attraction } from '../../attractions/entities/attraction.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'name_kh', nullable: true, type: 'varchar' })
  nameKh: string | null;

  // ✅ Bidirectional relationship
  @OneToMany(() => Attraction, (attraction) => attraction.province)
  attractions: Attraction[];
}
