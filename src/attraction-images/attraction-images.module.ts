import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttractionImagesController } from './attraction-images.controller';
import { AttractionImagesService } from './attraction-images.service';
import { Attraction } from '../attractions/entities/attraction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attraction])],
  controllers: [AttractionImagesController],
  providers: [AttractionImagesService],
  exports: [AttractionImagesService],
})
export class AttractionImagesModule {}
