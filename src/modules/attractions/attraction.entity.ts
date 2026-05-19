import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Province } from '../provinces/province.entity'

@Entity('attractions')
@Index(['category'])
@Index(['average_rating'])
@Index(['province_id'])
@Index(['deleted_at'])
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string
  
  @Column()
  name_en!: string

  @Column({ nullable: true })
  name_kh!: string

  @Column()
  province_id!: number

  @ManyToOne(() => Province, (province) => province.attractions)
  @JoinColumn({ name: 'province_id' })
  province?: Province

  @Column({ nullable: true })
  category!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location?: any

  @Column({ name: 'hero_image', type: 'text', nullable: true })
  hero_image?: string

  @Column({ name: 'photos', type: 'text', array: true, nullable: true })
  photos?: string[]

  @Column({ name: 'nearby_images', type: 'jsonb', nullable: true })
  nearby_images?: any

  @Column({ type: 'decimal', default: 0 })
  average_rating!: number

  @Column({ default: false })
  is_hidden_gem!: boolean

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @DeleteDateColumn()
  deleted_at!: Date
}
