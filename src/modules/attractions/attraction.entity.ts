import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity('attractions')
@Index(['category'])
@Index(['rating'])
@Index(['province_id'])
@Index(['status'])
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column('text', { nullable: true })
  description!: string

  @Column()
  province_id!: string

  @Column()
  category!: string

  @Column('simple-array', { nullable: true })
  sub_categories?: string[]

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number

  @Column({ type: 'integer', default: 0 })
  review_count!: number

  @Column({ nullable: true })
  address!: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number

  @Column({ nullable: true })
  image_url!: string

  @Column('text', { nullable: true })
  opening_hours!: string

  @Column({ nullable: true })
  entrance_fee!: number

  @Column({ type: 'boolean', default: true })
  is_open!: boolean

  @Column({ default: 'active' })
  status!: string

  @Column('simple-array', { nullable: true })
  amenities?: string[]

  @Column({ type: 'integer', default: 0 })
  visit_count!: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}
