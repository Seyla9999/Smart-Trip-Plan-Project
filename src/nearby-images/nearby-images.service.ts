import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { NearbyImage } from './entities/nearby-image.entity';

@Injectable()
export class NearbyImagesService {
  constructor(
    @InjectRepository(NearbyImage)
    private nearbyImageRepo: Repository<NearbyImage>,
  ) {}

  async findBySlug(placeSlug: string): Promise<NearbyImage[]> {
    return this.nearbyImageRepo.find({
      where: { placeSlug },
      order: { createdAt: 'ASC' },
    });
  }

  async addImage(placeSlug: string, imageUrl: string): Promise<NearbyImage> {
    const data: DeepPartial<NearbyImage> = { placeSlug, imageUrl };
    const record = this.nearbyImageRepo.create(data);
    return this.nearbyImageRepo.save(record) as Promise<NearbyImage>;
  }
}
