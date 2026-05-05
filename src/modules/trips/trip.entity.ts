import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { User } from '../users/user.entity'
import { TripMember } from './trip-member.entity'
import { ItineraryItem } from './itinerary-item.entity'
import { PackingListItem } from './packing-list-item.entity'

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column({ nullable: true })
  description!: string

  @Column({ nullable: true })
  start_date!: Date

  @Column({ nullable: true })
  end_date!: Date

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner!: User

  @Column()
  owner_id!: string

  @Column({ unique: true })
  invite_token!: string

  @Column({ default: 'active' })
  status!: string

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date

  @Column({ nullable: true })
  updated_at!: Date

  @Column({ nullable: true })
  deleted_at!: Date

  @OneToMany(() => TripMember, (m) => m.trip)
  members!: TripMember[]

  @OneToMany(() => ItineraryItem, (i) => i.trip)
  itinerary_items!: ItineraryItem[]

  @OneToMany(() => PackingListItem, (p) => p.trip)
  packing_list!: PackingListItem[]
}
