// ============================================================
// SAVE AS: src/modules/home/sponsors/sponsors.service.ts
// ============================================================
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './sponsor.entity';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private repo: Repository<Sponsor>,
  ) {}

  // Returns only active sponsors, sorted gold → silver → bronze
  async findAllActive() {
    const data = await this.repo.find({
      where: { is_active: true },
      order: {
        tier: 'ASC', // gold comes first alphabetically
        created_at: 'ASC',
      },
    });
    return { success: true, data };
  }
}
