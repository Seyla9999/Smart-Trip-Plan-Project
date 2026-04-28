// ============================================================
// SAVE AS: src/modules/home/weather/weather.controller.ts
// ============================================================
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly service: WeatherService) {}

  // GET /weather → weather for all provinces at once
  @Get()
  getAll() {
    return this.service.getAll();
  }

  // GET /weather/1 → weather for province id=1 (Siem Reap)
  @Get(':provinceId')
  getOne(@Param('provinceId', ParseIntPipe) id: number) {
    return this.service.getByProvince(id);
  }
}
