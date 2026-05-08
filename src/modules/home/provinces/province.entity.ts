import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_en: string;

  @Column()
  name_kh: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  main_image_url: string;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
