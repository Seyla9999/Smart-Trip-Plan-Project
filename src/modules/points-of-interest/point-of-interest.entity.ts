import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Province } from '../provinces/province.entity';

@Entity('points_of_interest')
export class PointOfInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'name_kh', nullable: true })
  nameKh: string;

  @Column()
  category: string; // 'hospital', 'police', 'restaurant', 'atm', 'cafe', 'pharmacy'

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  location: object; // PostGIS point (longitude, latitude)

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({ name: 'is_open_24h', default: false })
  isOpen24h: boolean;

  @Column({ name: 'province_id' })
  provinceId: number;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}