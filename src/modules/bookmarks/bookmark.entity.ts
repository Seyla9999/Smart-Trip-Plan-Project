import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  user!: User

  @Column()
  user_id!: string

  @Column()
  place_id!: string

  @Column({ nullable: true })
  place_name!: string

  @Column({ nullable: true })
  place_type!: string

  @Column({ nullable: true })
  place_image_url!: string

  @Column({ default: 'active' })
  status!: string

  @CreateDateColumn()
  created_at!: Date

  @Column({ nullable: true })
  updated_at!: Date
}