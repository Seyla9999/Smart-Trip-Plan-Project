// ============================================================
// SAVE AS: src/modules/home/weather/weather-cache.entity.ts
// ============================================================
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('weather_cache')
export class WeatherCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // One cache row per province
  @Column({ unique: true })
  province_id: number;

  @Column({ type: 'decimal', nullable: true })
  temp_celsius: number;

  // e.g. "Clear sky", "Partly cloudy", "Rain"
  @Column({ nullable: true })
  condition_text: string;

  // emoji icon e.g. "☀️", "🌧️"
  @Column({ nullable: true })
  icon_url: string;

  // Automatically updated every time we save new weather data
  @UpdateDateColumn()
  last_updated: Date;
}
