import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  description: string;

  // tier: gold | silver | bronze — used for sorting order on homepage
  @Column({ default: 'bronze' })
  tier: string;

  // is_active = true → shows on homepage sponsor bar
  // is_active = false → hidden (expired or removed)
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
