import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  password_hash!: string

  @Column()
  full_name!: string

  @Column({ nullable: true })
  username!: string

  @Column({ nullable: true })
  avatar_url!: string

  @Column({ nullable: true })
  bio!: string

  @Column({ default: 'traveler' })
  role!: string

  @Column({ nullable: true })
  last_login!: Date

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date

  @Column({ nullable: true })
  updated_at!: Date

  @Column({ nullable: true })
  deleted_at!: Date

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean

  @Column({ type: 'varchar', nullable: true })
  verification_code!: string | null
}