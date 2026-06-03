import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';
import { PackingListItem } from './packing-list-item.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() owner_id!: string;
  @Column() title!: string;
  @Column({ nullable: true }) description!: string;
  @Column({ type: 'date' }) start_date!: Date;
  @Column({ type: 'date' }) end_date!: Date;
  @Column({ nullable: true }) destination?: string;
  @Column({ nullable: true }) origin?: string;
  @Column({ nullable: true }) travel_type?: string;
  @Column({ default: 'planning' }) status!: string;
  @Column({ nullable: true, type: 'text' }) ai_summary?: string;
  @Column({ nullable: true }) invite_token?: string;
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz', nullable: true }) updated_at?: Date;
  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) deleted_at?: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner!: User;

  @OneToMany(() => TripMember, (m) => m.trip)
  members!: TripMember[];

  @OneToMany(() => ItineraryItem, (i) => i.trip)
  itinerary_items!: ItineraryItem[];

  @OneToMany(() => PackingListItem, (p) => p.trip)
  packing_list!: PackingListItem[];

  @Column('json', { nullable: true })
  locations?: { lat: number; lng: number; name: string }[];
}
