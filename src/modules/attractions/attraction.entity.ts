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

  @Column({ type: 'integer' })
  province_id!: number

  @Column({ type: 'varchar', nullable: true })
  name_en?: string

  @Column({ type: 'varchar', nullable: true })
  name_kh?: string

  @Column({ type: 'varchar' })
  category!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'geometry', nullable: true })
  location?: string

  @Column({ type: 'boolean', default: false })
  is_hidden_gem!: boolean

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  average_rating!: number

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
