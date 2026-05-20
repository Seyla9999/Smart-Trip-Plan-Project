import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../users/user.entity'

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('uuid')
  user_id!: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entity_type!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entity_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
