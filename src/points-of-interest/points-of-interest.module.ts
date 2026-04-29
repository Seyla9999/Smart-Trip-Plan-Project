import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointOfInterest } from './entities/point-of-interest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointOfInterest])],
  exports: [TypeOrmModule],
})
export class PointsOfInterestModule {}
