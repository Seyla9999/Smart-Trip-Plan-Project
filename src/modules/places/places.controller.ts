import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  ParseFloatPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlacesService } from './places.service';
import { firstValueFrom } from 'rxjs';

@Controller('api/places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  nearbySearch(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('type') type: string,
    @Query('radius', new DefaultValuePipe(15000), ParseIntPipe) radius: number,
  ) {
    return this.placesService.nearbySearch(lat, lng, type, radius);
  }

  @Get('photo')
  async photo(
    @Query('ref') ref: string,
    @Query('maxwidth', new DefaultValuePipe(400), ParseIntPipe) maxwidth: number,
    @Res() res: express.Response,
  ): Promise<void> {
    const stream$ = this.placesService.getPhotoStream(ref, maxwidth);
    const { data, headers } = await firstValueFrom(stream$);
    res.setHeader('Content-Type',  (headers['content-type'] as string) ?? 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    data.pipe(res);
  }

  @Get('details/:placeId')
  details(@Param('placeId') placeId: string) {
    return this.placesService.getDetails(placeId);
  }
}
