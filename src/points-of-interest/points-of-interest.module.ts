import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointOfInterest } from '../modules/points-of-interest/point-of-interest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointOfInterest])],
  exports: [TypeOrmModule],
})
export class PointsOfInterestModule {}
