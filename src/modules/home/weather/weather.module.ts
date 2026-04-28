// ============================================================
// SAVE AS: src/modules/home/weather/weather.module.ts
// ============================================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherCache } from './weather-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherCache]), HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
