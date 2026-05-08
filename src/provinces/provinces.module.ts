import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvincesController } from './provinces.controller';
import { ProvincesService } from './provinces.service';
import { Province } from './entities/province.entity';
import { Attraction } from '../attractions/entities/attraction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, Attraction])],
  controllers: [ProvincesController],
  providers: [ProvincesService],
})
export class ProvincesModule {}