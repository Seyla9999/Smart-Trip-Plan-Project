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
  async findOne(identifier: string): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier);
    let attraction: Attraction | null = null;

    if (isUuid) {
      attraction = await this.attractionRepository.findOne({
        where: { id: identifier, deletedAt: IsNull() },
        relations: ['province'],
      });
    } else {
      const nameEn = identifier.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      attraction = await this.attractionRepository.findOne({
        where: { nameEn, deletedAt: IsNull() },
        relations: ['province'],
      });
    }

    if (!attraction) {
      throw new NotFoundException(`Attraction "${identifier}" not found`);
    }

    // Get nearby points of interest within 5km using PostGIS
    const nearbyPOIs = await this.findNearbyPointsOfInterest(attraction);

    // Return attraction with nearby POIs
    return {
      ...attraction,
      nearbyPOIs,
    };
  }

  // POSTGIS QUERY: Find points of interest within 5km radius
  async findNearbyPointsOfInterest(attraction: Attraction): Promise<any> {
    // Check if attraction has location coordinates
    if (!attraction.location) {
      console.log('Attraction has no location data');
      return {
        hospitals: [],
        police: [],
        restaurants: [],
        atms: [],
        cafes: [],
        pharmacies: [],
      };
    }

    // Raw SQL query using PostGIS ST_DWithin
    const query = `
      SELECT 
        id,
        name_en as name,
        category,
        address,
        contact_number as contactNumber,
        is_open_24h as isOpen24h,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        ROUND(ST_Distance(
          location::geography, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        )) as distance_meters
      FROM points_of_interest
      WHERE 
        ST_DWithin(
          location::geography, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          5000  -- 5km radius in meters
        )
      ORDER BY distance_meters ASC
    `;

    // Extract coordinates (longitude, latitude) from PostGIS point
    let lng: number | null = null;
    let lat: number | null = null;

    if (attraction.location) {
      // Try to extract coordinates from the location object
      const loc = attraction.location as any;
      if (loc.coordinates) {
        lng = loc.coordinates[0];
        lat = loc.coordinates[1];
      } else if (loc.x !== undefined && loc.y !== undefined) {
        lng = loc.x;
        lat = loc.y;
      }
    }

    if (!lng || !lat) {
      console.log('Could not extract coordinates from attraction location');
      return {
        hospitals: [],
        police: [],
        restaurants: [],
        atms: [],
        cafes: [],
        pharmacies: [],
      };
    }

    // Execute the query
    const results = await this.attractionRepository.manager.query(query, [lng, lat]);

    // Group by category
    const grouped = {
      hospitals: results.filter((p: any) => p.category === 'hospital'),
      police: results.filter((p: any) => p.category === 'police'),
      restaurants: results.filter((p: any) => p.category === 'restaurant'),
      atms: results.filter((p: any) => p.category === 'atm'),
      cafes: results.filter((p: any) => p.category === 'cafe'),
      pharmacies: results.filter((p: any) => p.category === 'pharmacy'),
      all: results,
    };

    return grouped;
  }

  // Get all attractions
  async findAll(query: any) {
    const { province, category, limit = 20, page = 1 } = query;

    const queryBuilder = this.attractionRepository.createQueryBuilder('attraction')
      .leftJoinAndSelect('attraction.province', 'province')
      .where('attraction.deletedAt IS NULL');

    if (province) {
      queryBuilder.andWhere('province.nameEn ILIKE :province', { province: `%${province}%` });
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
    const attractions = await this.attractionRepository.createQueryBuilder('attraction')
      .leftJoinAndSelect('attraction.province', 'province')
      .where('province.nameEn ILIKE :provinceName', { provinceName: `%${provinceName}%` })
      .andWhere('attraction.deletedAt IS NULL')
      .getMany();

    return {
      success: true,
      count: attractions.length,
      data: attractions,
    };
  }

  // Seed Tatai Waterfall with location coordinates
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
      `SELECT id FROM provinces WHERE name_en ILIKE '%Koh Kong%' LIMIT 1`,
    );

    if (!province || province.length === 0) {
      console.log('⚠️ Koh Kong province not found. Please add it first.');
      console.log('Run this SQL in your database:');
      console.log(`INSERT INTO provinces (name_en, name_kh) VALUES ('Koh Kong', 'កោះកុង');`);
      return null;
    }

    // Tatai Waterfall coordinates (approximate - Cardamom Mountains)
    // Longitude: 103.2, Latitude: 11.6 (Koh Kong area)
    const location = {
      type: 'Point',
      coordinates: [103.2, 11.6],  // [longitude, latitude]
    };

    // Create Tatai Waterfall
    const attraction = this.attractionRepository.create({
      nameEn: 'Tatai Waterfall',
      nameKh: 'ទឹកធ្លាក់តាតៃ',
      provinceId: province[0].id,
      category: 'waterfall',
      description: `Located in the heart of the Cardamom Mountains, the Tatai Waterfall is a spectacular natural landmark where the fresh water of the Tatai River meets the salty seawater. This multi-tiered cascade is renowned for its wide, curtain-like flow that spans over 30 meters, creating a thunderous yet serene atmosphere that captivates every visitor.

Accessible only by a scenic boat ride through the lush mangrove forests or a challenging jungle trek, the journey to the falls is an adventure in itself. The best time to visit is during the rainy season (October to November) when the water volume is at its peak, transforming the landscape into a powerful display of nature's raw beauty and emerald-green vitality.`,
      isHiddenGem: true,
      averageRating: 4.9,
      location: location,
    });

    const saved = await this.attractionRepository.save(attraction);
    console.log('✅ Tatai Waterfall seeded successfully with location!');
    return saved;
  }
}
