import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Province } from './province.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private provinceRepo: Repository<Province>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    // Returns all provinces with attraction + accommodation count
    const data = await this.dataSource.query(`
      SELECT
        p.id,
        p.name_en,
        p.name_kh,
        p.description,
        p.main_image_url,
        COUNT(DISTINCT a.id)::int   AS attraction_count,
        COUNT(DISTINCT ac.id)::int  AS accommodation_count
      FROM provinces p
      LEFT JOIN attractions a
        ON a.province_id = p.id AND a.deleted_at IS NULL
      LEFT JOIN accommodations ac
        ON ac.province_id = p.id
      GROUP BY p.id
      ORDER BY p.id ASC
    `);
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.provinceRepo.findOne({ where: { id } });
    if (!data) return { success: false, message: 'Province not found' };
    return { success: true, data };
  }
}
