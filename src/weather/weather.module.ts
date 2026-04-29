import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from '../provinces/entities/province.entity';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherCache } from './entities/weather_cache.entity';
import { WeatherAlert } from './entities/weather_alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, WeatherCache, WeatherAlert])],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}