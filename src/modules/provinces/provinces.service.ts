import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async findAll(search?: string) {
    let query = `
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
    `;

    const params: any[] = [];

    if (search) {
      query += ` WHERE p.name_en ILIKE $1 OR p.name_kh ILIKE $1 `;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY p.id, p.name_en, p.name_kh, p.description, p.main_image_url ORDER BY p.id ASC `;

    const data = await this.dataSource.query(query, params);
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.provinceRepo.findOne({ where: { id } });
    if (!data) return { success: false, message: 'Province not found' };
    return { success: true, data };
  }

  async create(data: Partial<Province>) {
    try {
      if (!data.name_en || !data.name_kh) {
        throw new BadRequestException('name_en and name_kh are required');
      }

      // Using raw query to be absolutely sure about the insert
      const result = await this.dataSource.query(
        `INSERT INTO provinces (name_en, name_kh, description, main_image_url) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          data.name_en, 
          data.name_kh, 
          data.description || null, 
          data.main_image_url || null
        ]
      );
      
      return result[0];
    } catch (error) {
      console.error('Province creation error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message || 'Failed to create province');
    }
  }
}
