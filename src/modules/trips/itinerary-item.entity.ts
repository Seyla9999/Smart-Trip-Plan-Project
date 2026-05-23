import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Trip } from './trip.entity';

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Trip, (trip) => trip.itinerary_items, {
    onDelete: 'CASCADE',
  })
  trip!: Trip;

  @Column()
  trip_id!: string;

  @Column({ type: 'int', default: 0 })
  day_index!: number;

  // Sort order within a day (for drag-and-drop reordering later)
  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  start_time!: string;

  @Column({ nullable: true })
  end_time!: string;

  // Google place_id — stored so you can fetch fresh details later
  @Column({ nullable: true })
  place_id!: string;
}