import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../users/user.entity';

@Entity('trip_members')
export class TripMember {
  @ManyToOne(() => Trip, (trip) => trip.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @PrimaryColumn({ type: 'uuid' })
  trip_id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @PrimaryColumn({ type: 'uuid' })
  user_id!: string;

  @Column({ default: 'member' })
  role!: string;

  @CreateDateColumn()
  joined_at!: Date;
}
