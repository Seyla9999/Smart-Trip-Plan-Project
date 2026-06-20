import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';
import { Province } from '../provinces/province.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  origin?: string;

  province?: Province;

  @Column({ nullable: true })
  destination?: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  travel_type?: string;

  @Column({ type: 'text', nullable: true })
  ai_summary?: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date?: Date | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column()
  owner_id!: string;

  @Column({ type: 'uuid', unique: true })
  invite_token!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ nullable: true })
  updated_at!: Date;

  @Column({ nullable: true })
  deleted_at!: Date;

  @OneToMany(() => TripMember, (m) => m.trip)
  members!: TripMember[];

  @OneToMany(() => ItineraryItem, (i) => i.trip)
  itinerary_items!: ItineraryItem[];
}
