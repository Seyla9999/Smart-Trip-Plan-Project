// ============================================================
// SAVE AS: src/modules/home/weather/weather.service.ts
// Uses Open-Meteo API — FREE, no API key needed!
// ============================================================
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherCache } from './weather-cache.entity';

// Province ID → GPS coordinates for weather lookup
const PROVINCE_COORDS: Record<
  number,
  { lat: number; lng: number; name: string }
> = {
  1: { lat: 13.3671, lng: 103.8448, name: 'Siem Reap' },
  2: { lat: 11.5625, lng: 104.916, name: 'Phnom Penh' },
  3: { lat: 11.5637, lng: 102.9838, name: 'Koh Kong' },
  4: { lat: 10.6271, lng: 104.1799, name: 'Kampot' },
  5: { lat: 10.6097, lng: 103.5297, name: 'Sihanoukville' },
  6: { lat: 13.737, lng: 107.0048, name: 'Ratanakiri' },
  7: { lat: 12.458, lng: 107.1883, name: 'Mondulkiri' },
  8: { lat: 13.102, lng: 103.1988, name: 'Battambang' },
  9: { lat: 12.4886, lng: 106.0186, name: 'Kratié' },
  10: { lat: 10.4833, lng: 104.3167, name: 'Kep' },
  11: { lat: 14.0, lng: 105.2, name: 'Preah Vihear' },
  12: { lat: 10.9799, lng: 104.781, name: 'Takéo' },
};

@Injectable()
export class WeatherService {
  constructor(
    @InjectRepository(WeatherCache)
    private cacheRepo: Repository<WeatherCache>,
    private httpService: HttpService,
  ) {}

  // Get weather for ONE province
  async getByProvince(provinceId: number) {
    // Step 1: Check cache — if updated within last 2 hours, return cached data
    const cached = await this.cacheRepo.findOne({
      where: { province_id: provinceId },
    });
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    if (cached && cached.last_updated > twoHoursAgo) {
      return { success: true, data: cached, source: 'cache' };
    }

    // Step 2: Check coordinates exist
    const coords = PROVINCE_COORDS[provinceId];
    if (!coords) {
      return { success: false, message: 'Province not found' };
    }

    // Step 3: Call Open-Meteo API (free, no key needed)
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${coords.lat}&longitude=${coords.lng}` +
        `&current_weather=true&temperature_unit=celsius`;

      const response = await firstValueFrom(this.httpService.get(url));
      const w = response.data.current_weather;

      const condition = this.codeToText(w.weathercode);
      const icon = this.codeToIcon(w.weathercode);

      // Step 4: Save/update cache in database
      await this.cacheRepo.upsert(
        {
          province_id: provinceId,
          temp_celsius: w.temperature,
          condition_text: condition,
          icon_url: icon,
        },
        ['province_id'],
      );

      return {
        success: true,
        data: {
          province_id: provinceId,
          province_name: coords.name,
          temp_celsius: w.temperature,
          condition_text: condition,
          icon_url: icon,
          last_updated: new Date(),
        },
        source: 'live',
      };
    } catch {
      // If API fails, return old cached data rather than error
      if (cached)
        return { success: true, data: cached, source: 'cache_fallback' };
      return { success: false, message: 'Weather unavailable' };
    }
  }

  // Get weather for ALL provinces at once (used by homepage)
  async getAll() {
    const ids = Object.keys(PROVINCE_COORDS).map(Number);
    const results = await Promise.allSettled(
      ids.map((id) => this.getByProvince(id)),
    );

    // Build object: { 1: {...}, 2: {...}, ... }
    const data: Record<number, any> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.success) {
        data[ids[i]] = r.value.data;
      }
    });

    return { success: true, data };
  }

  // Convert Open-Meteo weather code to readable text
  private codeToText(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code <= 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rain';
    if (code <= 84) return 'Rain showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  }

  // Convert code to emoji icon
  private codeToIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code === 3) return '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌧️';
    if (code <= 84) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌡️';
  }
}
