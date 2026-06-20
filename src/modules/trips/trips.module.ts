import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trip } from './trip.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';

import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';

import { AuthModule } from '../auth/auth.module';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      TripMember,
      ItineraryItem,
    ]),
    AuthModule,
    PlacesModule, 
  ],
  providers:   [TripsService],
  controllers: [TripsController],
  exports:     [TripsService],
})
export class TripsModule {}