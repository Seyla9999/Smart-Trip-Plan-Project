import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../provinces/entities/province.entity';
import { WeatherCache } from './entities/weather_cache.entity';
import { WeatherAlert } from './entities/weather_alert.entity';

@Injectable()
export class WeatherService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(WeatherCache)
    private readonly weatherCacheRepository: Repository<WeatherCache>,

    @InjectRepository(WeatherAlert)
    private readonly weatherAlertRepository: Repository<WeatherAlert>,
  ) {}

  async getProvinceWeather(provinceId: number) {
    const province = await this.provinceRepository.findOne({
      where: { id: provinceId },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const cachedWeather = await this.weatherCacheRepository.findOne({
      where: { provinceId },
    });

    const alerts = await this.weatherAlertRepository.find({
      where: { provinceId },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!cachedWeather) {
      const freshWeather = await this.fetchAndSaveWeather(provinceId, province.nameEn);

      return {
        province: {
          id: province.id,
          nameEn: province.nameEn,
          nameKh: province.nameKh,
        },
        weather: freshWeather,
        alerts,
      };
    }

    return {
      province: {
        id: province.id,
        nameEn: province.nameEn,
        nameKh: province.nameKh,
      },
      weather: cachedWeather,
      alerts,
    };
  }

  private async fetchAndSaveWeather(provinceId: number, provinceName: string) {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is missing');
    }

    const geoUrl =
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(provinceName + ',KH')}&limit=1&appid=${apiKey}`;

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!Array.isArray(geoData) || geoData.length === 0) {
      throw new NotFoundException('Province coordinates not found from weather API');
    }

    const { lat, lon } = geoData[0];

    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const existingCache = await this.weatherCacheRepository.findOne({
      where: { provinceId },
    });

    if (existingCache) {
      existingCache.tempCelsius = Number(weatherData?.main?.temp ?? 0);
      existingCache.conditionText = weatherData?.weather?.[0]?.description ?? null;
      existingCache.iconUrl = weatherData?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
        : null;
      existingCache.lastUpdated = new Date();

      return this.weatherCacheRepository.save(existingCache);
    }

    const newCache = this.weatherCacheRepository.create({
      provinceId,
      tempCelsius: Number(weatherData?.main?.temp ?? 0),
      conditionText: weatherData?.weather?.[0]?.description ?? null,
      iconUrl: weatherData?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
        : null,
      lastUpdated: new Date(),
    });

    return this.weatherCacheRepository.save(newCache);
  }
}