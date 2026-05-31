import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
 
const GOOGLE_BASE = 'https://maps.googleapis.com/maps/api/place';
 
// Minimal shape returned to the frontend (no key leaked)
function mapPlace(p: any) {
  return {
    place_id: p.place_id,
    name: p.name,
    vicinity: p.vicinity,
    rating: p.rating,
    user_ratings_total: p.user_ratings_total,
    opening_hours:p.opening_hours,
    geometry: { location: p.geometry?.location },
    photos: (p.photos ?? []).slice(0, 1).map((ph: any) => ({
      photo_reference: ph.photo_reference,
      width: ph.width,
      height: ph.height,
    })),
    types: p.types,
  };
}

@Injectable()
export class PlacesService {
  private readonly key: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.key = this.config.get<string>('GOOGLE_PLACES_KEY') ?? '';
  }

  // ── Nearby Search ─────────────────────────────────────────────────────────
  async nearbySearch(lat: number, lng: number, type: string, radius = 15000) {
    if (!this.key) throw new HttpException('GOOGLE_PLACES_KEY not set', HttpStatus.INTERNAL_SERVER_ERROR);

    const { data } = await firstValueFrom(
      this.http.get(`${GOOGLE_BASE}/nearbysearch/json`, {
        params: { location: `${lat},${lng}`, radius, type, key: this.key, language: 'en' },
      }),
    );

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new HttpException(`Google Places: ${data.status}`, HttpStatus.BAD_GATEWAY);
    }

    return { status: data.status, results: (data.results ?? []).map(mapPlace) };
  }

  // ── Photo Proxy ───────────────────────────────────────────────────────────
  // Returns an Observable stream — pipe directly to res in controller
  getPhotoStream(photoReference: string, maxwidth = 400) {
    if (!this.key)
      throw new HttpException(
        'GOOGLE_PLACES_KEY not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return this.http.get(`${GOOGLE_BASE}/photo`, {
      params: { photoreference: photoReference, maxwidth, key: this.key },
      responseType: 'stream',
    });
  }

  async getDetails(placeId: string) {
    if (!this.key)
      throw new HttpException(
        'GOOGLE_PLACES_KEY not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const fields = [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'opening_hours',
      'photos',
      'reviews',
      'geometry',
      'price_level',
      'editorial_summary',
    ].join(',');

    const { data } = await firstValueFrom(
      this.http.get(`${GOOGLE_BASE}/details/json`, {
        params: { place_id: placeId, fields, key: this.key, language: 'en' },
      }),
    );

    return data.result ?? {};
  }
}
