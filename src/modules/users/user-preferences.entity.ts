import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: string;

  @Column({ type: 'json', nullable: true })
  favorite_categories!: string[];

  @Column({ type: 'json', nullable: true })
  travel_preferences!: object;

  @Column({ type: 'boolean', default: true })
  email_notifications!: boolean;

  @Column({ type: 'boolean', default: true })
  bookmark_notifications!: boolean;

  @Column({ nullable: true })
  theme!: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ nullable: true })
  updated_at!: Date;
}
