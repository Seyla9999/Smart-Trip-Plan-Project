import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Trip } from './trip.entity';

@Entity('packing_list_items')
export class PackingListItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Trip, (trip) => trip.packing_list, { onDelete: 'CASCADE' })
  trip!: Trip;

  @Column()
  trip_id!: string;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'boolean', default: false })
  packed!: boolean;
}
