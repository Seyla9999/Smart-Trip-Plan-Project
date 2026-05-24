import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { Attraction } from '../attractions/attraction.entity';

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Trip, (trip) => trip.itinerary_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column()
  trip_id!: string;

  @Column({ name: 'day_number', type: 'int', default: 0 })
  day_index!: number;

  @ManyToOne(() => Attraction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'attraction_id' })
  attraction?: Attraction;

  @Column({ type: 'uuid', nullable: true })
  attraction_id?: string;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'time', nullable: true })
  start_time!: string;

  @Column({ type: 'time', nullable: true })
  end_time!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @UpdateDateColumn({ nullable: true })
  updated_at!: Date;
}