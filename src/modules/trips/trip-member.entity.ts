import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../users/user.entity';

@Entity('trip_members')
export class TripMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Trip, (trip) => trip.members, { onDelete: 'CASCADE' })
  trip!: Trip;

  @Column()
  trip_id!: string;

  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @Column()
  user_id!: string;

  @Column({ default: 'member' })
  role!: string;

  @CreateDateColumn()
  joined_at!: Date;
}
