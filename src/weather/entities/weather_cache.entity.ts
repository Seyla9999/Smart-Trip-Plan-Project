import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('weather_cache')
export class WeatherCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'province_id', type: 'int', unique: true })
  provinceId: number;

  @Column({ name: 'temp_celsius', type: 'decimal', nullable: true })
  tempCelsius: number;

 @Column({ name: 'condition_text', type: 'varchar', nullable: true })
conditionText: string | null;

@Column({ name: 'icon_url', type: 'text', nullable: true })
iconUrl: string | null;
  @Column({ name: 'last_updated', type: 'timestamptz', nullable: true })
  lastUpdated: Date;
}