import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearbyImage } from './entities/nearby-image.entity';
import { NearbyImagesService } from './nearby-images.service';
import { NearbyImagesController } from './nearby-images.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NearbyImage])],
  controllers: [NearbyImagesController],
  providers: [NearbyImagesService],
})
export class NearbyImagesModule {}
