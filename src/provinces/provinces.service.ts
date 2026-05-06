import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { Attraction } from '../attractions/entities/attraction.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(Attraction)
    private readonly attractionRepository: Repository<Attraction>,
  ) {}

  async getAllProvinces() {
    return this.provinceRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getProvinceAttractions(id: number) {
    const province = await this.provinceRepository.findOne({
      where: { id },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const attractions = await this.attractionRepository.find({
      where: { provinceId: id },
      order: {
        isHiddenGem: 'DESC',
        averageRating: 'DESC',
      },
    });

    return {
      province,
      attractions,
    };
  }
}