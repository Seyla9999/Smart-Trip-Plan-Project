import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() user_id: string;
  @Column({ nullable: true }) trip_id: string;
  @Column() title: string;
  @Column({ nullable: true, type: 'text' }) content: string;
  @Column({ default: 'pending' }) status: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @DeleteDateColumn() deleted_at: Date;
}
