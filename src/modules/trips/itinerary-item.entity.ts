import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Trip } from './trip.entity'

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Trip, (trip) => trip.itinerary_items, { onDelete: 'CASCADE' })
  trip!: Trip

  @Column()
  trip_id!: string

  @Column({ type: 'int', default: 0 })
  day_index!: number

  @Column()
  title!: string

  @Column({ nullable: true })
  description!: string

  @Column({ nullable: true })
  location!: string

  @Column({ nullable: true })
  start_time!: string

  @Column({ nullable: true })
  end_time!: string
}
