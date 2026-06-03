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

  async findAllActive() {
    const data = await this.repo
      .createQueryBuilder('s')
      .where('s.is_active = true')
      .orderBy(
        `CASE s.tier
          WHEN 'gold'   THEN 1
          WHEN 'silver' THEN 2
          WHEN 'bronze' THEN 3
          ELSE 4
        END`,
      )
      .addOrderBy('s.created_at', 'ASC')
      .getMany();

    return { success: true, data };
  }

  async create(data: Partial<Sponsor>) {
    const sponsor = this.repo.create(data);
    const saved = await this.repo.save(sponsor);
    return { success: true, data: saved };
  }
}
