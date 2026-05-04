import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attraction } from './attraction.entity';

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attraction)
    private repo: Repository<Attraction>,
  ) {}

  // GET /attractions?category=Sea&province=Koh Kong&limit=4
  async findAll(q: {
    category?: string;
    province?: string;
    province_id?: number;
    is_hidden_gem?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const limit = Number(q.limit) || 20;
    const page  = Number(q.page)  || 1;

    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.province', 'p')
      .where('a.deleted_at IS NULL');

    if (q.category)    qb.andWhere('a.category = :c',              { c: q.category });
    if (q.province_id) qb.andWhere('a.province_id = :pid',         { pid: Number(q.province_id) });
    if (q.province)    qb.andWhere('p.name_en ILIKE :pn',          { pn: `%${q.province}%` });
    if (q.search)      qb.andWhere('(a.name_en ILIKE :s OR a.name_kh ILIKE :s)', { s: `%${q.search}%` });

    if (q.is_hidden_gem === 'true') {
      qb.andWhere('a.is_hidden_gem = true');
    }

    const [data, total] = await qb
      .orderBy('a.average_rating', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return { success: true, data, meta: { total, page, limit } };
  }

  // GET /attractions/hidden-gems → returns only is_hidden_gem = true, not soft-deleted
  async findHiddenGems(limit = 5) {
    const data = await this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.province', 'p')
      .where('a.deleted_at IS NULL')          // ← explicit soft-delete guard
      .andWhere('a.is_hidden_gem = true')
      .orderBy('a.average_rating', 'DESC')
      .take(limit)
      .getMany();

    return { success: true, data };
  }

  // GET /attractions/:id
  async findOne(id: string) {
    const data = await this.repo.findOne({
      where: { id },
      relations: ['province'],
    });
    if (!data) return { success: false, message: 'Attraction not found' };
    return { success: true, data };
  }
}