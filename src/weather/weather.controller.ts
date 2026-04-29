import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('provinces')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get(':id/weather')
  getProvinceWeather(@Param('id', ParseIntPipe) id: number) {
    return this.weatherService.getProvinceWeather(id);
  }
}