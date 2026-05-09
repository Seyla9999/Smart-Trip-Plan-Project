import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm'
import { Attraction } from './attraction.entity'
import { FilterAttractionsDto } from './dto/filter-attractions.dto'
import { CreateAttractionDto } from './dto/create-attraction.dto'
import { UpdateAttractionDto } from './dto/update-attraction.dto'

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attraction)
    private attractionRepo: Repository<Attraction>,
  ) {}

  async findAll(filters: FilterAttractionsDto) {
    let query = this.attractionRepo.createQueryBuilder('attraction')
      .where('attraction.deleted_at IS NULL') // Only show non-deleted

    if (filters.search) {
      const searchTerm = `%${filters.search}%`
      query = query.andWhere(
        '(attraction.name_en ILIKE :search OR attraction.name_kh ILIKE :search OR attraction.description ILIKE :search)',
        { search: searchTerm },
      )
    }

    if (filters.category) {
      query = query.andWhere('attraction.category = :category', {
        category: filters.category,
      })
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.andWhere('attraction.category IN (:...categories)', {
        categories: filters.categories,
      })
    }

    if (filters.mainCategory) {
      query = query.andWhere('attraction.category = :mainCategory', {
        mainCategory: filters.mainCategory,
      })
    }

    if (filters.minRating !== undefined) {
      query = query.andWhere('attraction.average_rating >= :minRating', {
        minRating: filters.minRating,
      })
    }

    if (filters.maxRating !== undefined) {
      query = query.andWhere('attraction.average_rating <= :maxRating', {
        maxRating: filters.maxRating,
      })
    }

    if (filters.province_id) {
      query = query.andWhere('attraction.province_id = :province_id', {
        province_id: filters.province_id,
      })
    }

    const sortField = this.getSortField(filters.sortBy || 'rating')
    const sortOrder = filters.sortOrder || 'DESC'
    query = query.orderBy(sortField, sortOrder)

      query.orderBy(`attraction.${sortField}`, sortOrder)

      if (limit !== undefined) {
        query.skip(offset)
        query.take(limit)
      }
    const total = await query.getCount()
    const data = await query.getMany()

      const [data, total] = await query.getManyAndCount()
      const responseLimit = limit ?? total
      const pages = responseLimit > 0 ? Math.ceil(total / responseLimit) : 0

      return {
        data,
        pagination: {
          total,
          limit: responseLimit,
          offset: limit !== undefined ? offset : 0,
          pages,
        },
      }
    } catch (error) {
      console.error('findAll error:', error)
      throw error
    }
  }

  // Find single attraction by id or slug (supports id or name-based slug)
  async findOne(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier)

    let attraction: Attraction | null = null

    if (isUuid) {
      attraction = await this.attractionRepo.findOne({ where: { id: identifier, deleted_at: IsNull() } as any })
    } else {
      // try converting slug (e.g. tatai-waterfall) into a flexible search
      const nameLike = `%${identifier.replace(/-/g, ' ')}%`
      attraction = await this.attractionRepo
        .createQueryBuilder('attraction')
        .where('attraction.deleted_at IS NULL')
        .andWhere('(attraction.name_en ILIKE :nameLike OR attraction.name_kh ILIKE :nameLike)', { nameLike })
        .getOne()
    }

    if (!attraction) {
      throw new NotFoundException(`Attraction "${identifier}" not found`)
    }

    const nearbyPOIs = await this.findNearbyPointsOfInterest(attraction as any)

    return {
      ...attraction,
      nearbyPOIs,
    }
  }

  // Find nearby points of interest (PostGIS) — returns grouped categories
  async findNearbyPointsOfInterest(attraction: any) {
    if (!attraction || !attraction.location) {
      return {
        hospitals: [],
        police: [],
        restaurants: [],
        atms: [],
        cafes: [],
        pharmacies: [],
      }
    }

    // build query
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
          5000
        )
      ORDER BY distance_meters ASC
    `

    let lng: number | null = null
    let lat: number | null = null
    const loc = attraction.location as any
    if (loc) {
      if (loc.coordinates) {
        lng = loc.coordinates[0]
        lat = loc.coordinates[1]
      } else if (loc.x !== undefined && loc.y !== undefined) {
        lng = loc.x
        lat = loc.y
      }
    }

    if (!lng || !lat) {
      return {
        hospitals: [],
        police: [],
        restaurants: [],
        atms: [],
        cafes: [],
        pharmacies: [],
      }
    }

    const results = await this.attractionRepo.manager.query(query, [lng, lat])

    return {
      hospitals: results.filter((p: any) => p.category === 'hospital'),
      police: results.filter((p: any) => p.category === 'police'),
      restaurants: results.filter((p: any) => p.category === 'restaurant'),
      atms: results.filter((p: any) => p.category === 'atm'),
      cafes: results.filter((p: any) => p.category === 'cafe'),
      pharmacies: results.filter((p: any) => p.category === 'pharmacy'),
      all: results,
    }
  }

  // Seed Tatai Waterfall (useful for local testing)
  async seedTataiWaterfall() {
    const existing = await this.attractionRepo.findOne({ where: { name_en: 'Tatai Waterfall', deleted_at: IsNull() } as any })
    if (existing) return existing

    const province = await this.attractionRepo.manager.query(
      `SELECT id FROM provinces WHERE name_en ILIKE '%Koh Kong%' LIMIT 1`,
    )

    if (!province || province.length === 0) {
      console.log('Koh Kong province not found; please add it first')
      return null
    }

    const location = { type: 'Point', coordinates: [103.2, 11.6] }

    const attraction = this.attractionRepo.create({
      name_en: 'Tatai Waterfall',
      name_kh: 'ទឹកធ្លាក់តាតៃ',
      province_id: province[0].id,
      category: 'waterfall',
      description: `A scenic waterfall in the Cardamom Mountains.`,
      is_hidden_gem: true,
      average_rating: 4.9,
      location,
    } as any)

    const saved = await this.attractionRepo.save(attraction)
    return saved
  }

  async findByCategory(category: string, limit: number = 10, offset: number = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { category, deleted_at: IsNull() },
      order: { average_rating: 'DESC' },
      take: limit,
      skip: offset,
    })

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findByProvince(province_id: string, limit: number = 10, offset: number = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { province_id: parseInt(province_id), deleted_at: IsNull() },
      order: { average_rating: 'DESC' },
      take: limit,
      skip: offset,
    })

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findTopRated(limit: number = 10) {
    return this.attractionRepo.find({
      where: { deleted_at: IsNull() },
      order: { average_rating: 'DESC' },
      take: limit,
    })
  }

  // Find hidden gems (attractions marked as is_hidden_gem = true)
  async findHiddenGems(limit: number = 5) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { is_hidden_gem: true, deleted_at: IsNull() },
      order: { average_rating: 'DESC' },
      take: limit,
    })

    return {
      success: true,
      data,
      pagination: { total, limit },
    }
  }

  async findById(id: string) {
    return this.attractionRepo.findOne({
      where: { id, deleted_at: IsNull() },
    })
  }

  async create(dto: CreateAttractionDto) {
    try {
      console.log('Creating attraction with data:', dto)
      const attraction = this.attractionRepo.create(dto)
      console.log('Created entity instance:', attraction)
      const result = await this.attractionRepo.save(attraction)
      console.log('Saved attraction:', result)
      return result
    } catch (error) {
      console.error('Create error:', error)
      throw error
    }
  }

  async update(id: string, dto: Partial<CreateAttractionDto>) {
    const updateData: any = { ...dto }
    if (dto.province_id) {
      updateData.province_id = parseInt(dto.province_id as any)
    }
    await this.attractionRepo.update({ id }, updateData)
    return this.findById(id)
  }

  async delete(id: string) {
    const attraction = await this.attractionRepo.findOne({ where: { id } })
    if (attraction) {
      return this.attractionRepo.softRemove(attraction)
    }
    return null
  }

  async getCategories() {
    const result = await this.attractionRepo
      .createQueryBuilder('attraction')
      .select('DISTINCT attraction.category', 'category')
      .where('attraction.deleted_at IS NULL')
      .andWhere('attraction.category IS NOT NULL')
      .getRawMany()

    return result.map((r) => r.category).filter(Boolean)
  }

  async getStatistics() {
    const [attractions, topRated, avgRating] = await Promise.all([
      this.attractionRepo.count({ where: { deleted_at: IsNull() } }),
      this.attractionRepo.find({
        where: { deleted_at: IsNull() },
        order: { average_rating: 'DESC' },
        take: 5,
      }),
      this.attractionRepo
        .createQueryBuilder('attraction')
        .select('AVG(attraction.average_rating)', 'average')
        .where('attraction.deleted_at IS NULL')
        .getRawOne(),
    ])

    return {
      totalAttractions: attractions,
      averageRating: parseFloat(avgRating?.average || 0),
      topRated,
    }
  }

  private getSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      rating: 'attraction.average_rating',
      name: 'attraction.name_en',
      createdAt: 'attraction.created_at',
    }
    return fieldMap[sortBy] || 'attraction.average_rating'
  }
}

