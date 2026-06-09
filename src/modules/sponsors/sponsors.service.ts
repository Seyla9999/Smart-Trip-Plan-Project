import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './sponsor.entity';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepo: Repository<Sponsor>,
  ) {}

  async findAllActive() {
    return this.sponsorRepo.find({
      where: { is_active: true },
      order: { tier: 'ASC', name: 'ASC' },
    });
  }

  async create(data: any) {
    const sponsor = this.sponsorRepo.create(data);
    return this.sponsorRepo.save(sponsor);
  }
}