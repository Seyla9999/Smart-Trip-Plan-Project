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
@Index(['average_rating'])
@Index(['province_id'])
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'integer', nullable: true })
  province_id?: number

  @Column({ type: 'varchar' })
  name_en!: string

  @Column({ type: 'varchar', nullable: true })
  name_kh?: string

  @Column({ type: 'varchar', nullable: true })
  category?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'geometry', nullable: true })
  location?: string

  @Column({ type: 'boolean', default: false })
  is_hidden_gem!: boolean

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  average_rating!: number

  @Column({ type: 'text', nullable: true })
  hero_image?: string

  @Column({ type: 'text', array: true, nullable: true })
  photos?: string[]

  @Column({ type: 'jsonb', nullable: true })
  nearby_images?: object | null

  @Column({ type: 'text', nullable: true })
  image_url?: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date

  // Getter for backward compatibility
  get name(): string {
    return this.name_en || this.name_kh || ''
  }

  get rating(): number {
    return Number(this.average_rating) || 0
  }
}
