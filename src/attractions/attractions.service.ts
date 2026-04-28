import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Attraction } from './entities/attraction.entity';

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attraction)
    private attractionRepository: Repository<Attraction>,
  ) {}

  // Get single attraction by ID or name slug
  async findOne(identifier: string): Promise<Attraction> {
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier);

    let attraction: Attraction | null = null;

    if (isUuid) {
      // ✅ Uncomment relations for UUID lookup
      attraction = await this.attractionRepository.findOne({
        where: {
          id: identifier,
          deletedAt: IsNull(),
        },
        relations: ['province'], // ← UNCOMMENT THIS
      });
    } else {
      const nameEn = identifier
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      attraction = await this.attractionRepository.findOne({
        where: {
          nameEn,
          deletedAt: IsNull(),
        },
        relations: ['province'], // ✅ Keep this
      });
    }

    if (!attraction) {
      throw new NotFoundException(`Attraction "${identifier}" not found`);
    }

    return attraction;
  }

  // Get all attractions
  async findAll(query: any) {
    const { province, category, limit = 20, page = 1 } = query;

    const queryBuilder = this.attractionRepository
      .createQueryBuilder('attraction')
      .leftJoinAndSelect('attraction.province', 'province')
      .where('attraction.deletedAt IS NULL');

    if (province) {
      queryBuilder.andWhere('province.nameEn ILIKE :province', {
        province: `%${province}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('attraction.category = :category', { category });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('attraction.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Get attractions by province
  async findByProvince(provinceName: string) {
    const attractions = await this.attractionRepository
      .createQueryBuilder('attraction')
      .leftJoinAndSelect('attraction.province', 'province')
      .where('province.nameEn ILIKE :provinceName', {
        provinceName: `%${provinceName}%`,
      })
      .andWhere('attraction.deletedAt IS NULL')
      .getMany();

    return {
      success: true,
      count: attractions.length,
      data: attractions,
    };
  }

  // Seed Tatai Waterfall
  async seedTataiWaterfall() {
    // Check if already exists
    const existing = await this.attractionRepository.findOne({
      where: { nameEn: 'Tatai Waterfall', deletedAt: IsNull() },
    });

    if (existing) {
      console.log('✅ Tatai Waterfall already exists');
      return existing;
    }

    // Find Koh Kong province
    const province = await this.attractionRepository.manager.query(
      `SELECT id FROM provinces WHERE name_en ILIKE '%Koh Kong%' LIMIT 1`
    );

    if (!province.length) {
      console.log('⚠️ Koh Kong province not found. Please add it first.');
      console.log('Run this SQL in your database:');
      console.log(`INSERT INTO provinces (name_en, name_kh) VALUES ('Koh Kong', 'កោះកុង');`);
      return null;
    }

    // ✅ Fix: Create attraction properly
    const attraction = new Attraction();
    attraction.nameEn = 'Tatai Waterfall';
    attraction.nameKh = 'ទឹកធ្លាក់តាតៃ';
    attraction.provinceId = province[0].id;
    attraction.category = 'waterfall';
    attraction.description = `Located in the heart of the Cardamom Mountains, the Tatai Waterfall is a spectacular natural landmark where the fresh water of the Tatai River meets the salty seawater. This multi-tiered cascade is renowned for its wide, curtain-like flow that spans over 30 meters, creating a thunderous yet serene atmosphere that captivates every visitor.

Accessible only by a scenic boat ride through the lush mangrove forests or a challenging jungle trek, the journey to the falls is an adventure in itself. The best time to visit is during the rainy season (October to November) when the water volume is at its peak, transforming the landscape into a powerful display of nature's raw beauty and emerald-green vitality.`;
    attraction.isHiddenGem = true;
    attraction.averageRating = 4.9;
    
    const saved = await this.attractionRepository.save(attraction);
    console.log('✅ Tatai Waterfall seeded successfully!');
    return saved;
  }
}
