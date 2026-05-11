import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, DataSource } from 'typeorm'
import { Attraction } from './attraction.entity'
import { FilterAttractionsDto } from './dto/filter-attractions.dto'
import { CreateAttractionDto } from './dto/create-attraction.dto'
import { UpdateAttractionDto } from './dto/update-attraction.dto'

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attraction)
    private attractionRepo: Repository<Attraction>,
    private dataSource: DataSource,
  ) {}

  async findAll(filters: FilterAttractionsDto & {
    province?: string
    province_id?: number
    is_hidden_gem?: string
    limit?: number
    page?: number
    offset?: number
  }) {
    const limit  = Number(filters.limit)  || 20
    const page   = Number(filters.page)   || 1
    const offset = Number(filters.offset) || (page - 1) * limit
    const conditions: string[] = ['a.deleted_at IS NULL']
    const params: any[]        = []
    let   idx                  = 1

    if (filters.category)    { conditions.push(`a.category = $${idx++}`);                                    params.push(filters.category) }
    if (filters.province_id) { conditions.push(`a.province_id = $${idx++}`);                                 params.push(Number(filters.province_id)) }
    if (filters.province)    { conditions.push(`p.name_en ILIKE $${idx++}`);                                 params.push(`%${filters.province}%`) }
    if (filters.search)      { conditions.push(`(a.name_en ILIKE $${idx} OR a.name_kh ILIKE $${idx++})`);   params.push(`%${filters.search}%`) }
    if (filters.is_hidden_gem === 'true') { conditions.push(`a.is_hidden_gem = true`) }
    if (filters.minRating !== undefined) { conditions.push(`a.average_rating >= $${idx++}`); params.push(filters.minRating) }

    const where = conditions.join(' AND ')

    const countResult = await this.dataSource.query(
      `SELECT COUNT(DISTINCT a.id) FROM attractions a
       LEFT JOIN provinces p ON p.id = a.province_id
       WHERE ${where}`,
      params,
    )
    const total = parseInt(countResult[0].count, 10)
    const data = await this.dataSource.query(
      `SELECT
        a.id,
        a.province_id,
        a.name_en,
        a.name_kh,
        a.category,
        a.average_rating,
        a.is_hidden_gem,
        a.image_url,
        a.hero_image,
        COUNT(r.id)::int AS review_count,
        json_build_object(
          'id',             p.id,
          'name_en',        p.name_en,
          'name_kh',        p.name_kh,
          'main_image_url', p.main_image_url
        ) AS province
       FROM attractions a
       LEFT JOIN provinces p ON p.id = a.province_id
       LEFT JOIN reviews   r ON r.attraction_id = a.id
       WHERE ${where}
       GROUP BY a.id, p.id
       ORDER BY a.average_rating DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    )

    return {
      success: true,
      data,
      meta:       { total, page, limit },
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) },
    }
  }

  async findHiddenGems(limit: number = 5) {
    const data = await this.dataSource.query(
      `SELECT
        a.id,
        a.province_id,
        a.name_en,
        a.name_kh,
        a.category,
        a.average_rating,
        a.is_hidden_gem,
        a.image_url,
        a.hero_image,
        COUNT(r.id)::int AS review_count,
        json_build_object(
          'id',             p.id,
          'name_en',        p.name_en,
          'name_kh',        p.name_kh,
          'main_image_url', p.main_image_url
        ) AS province
       FROM attractions a
       LEFT JOIN provinces p ON p.id = a.province_id
       LEFT JOIN reviews   r ON r.attraction_id = a.id
       WHERE a.deleted_at IS NULL
         AND a.is_hidden_gem = true
       GROUP BY a.id, p.id
       ORDER BY a.average_rating DESC
       LIMIT $1`,
      [limit],
    )
    return { success: true, data }
  }

  async findOne(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(identifier)

    let attraction: Attraction | null = null

    if (isUuid) {
      attraction = await this.attractionRepo.findOne({
        where: { id: identifier, deleted_at: IsNull() } as any,
      })
    } else {
      const nameLike = `%${identifier.replace(/-/g, ' ')}%`
      attraction = await this.attractionRepo
        .createQueryBuilder('attraction')
        .where('attraction.deleted_at IS NULL')
        .andWhere('(attraction.name_en ILIKE :nameLike OR attraction.name_kh ILIKE :nameLike)', { nameLike })
        .getOne()
    }

    if (!attraction) throw new NotFoundException(`Attraction "${identifier}" not found`)

    const nearbyPOIs = await this.findNearbyPointsOfInterest(attraction as any)
    return { ...attraction, nearbyPOIs }
  }

  async findNearbyPointsOfInterest(attraction: any) {
    if (!attraction?.location) {
      return { hospitals: [], police: [], restaurants: [], atms: [], cafes: [], pharmacies: [] }
    }

    const query = `
      SELECT id, name_en as name, category, address, contact_number as contactNumber,
             is_open_24h as isOpen24h,
             ST_X(location::geometry) as longitude,
             ST_Y(location::geometry) as latitude,
             ROUND(ST_Distance(location::geography,
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)) as distance_meters
      FROM points_of_interest
      WHERE ST_DWithin(location::geography,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 5000)
      ORDER BY distance_meters ASC`

    let lng: number | null = null
    let lat: number | null = null
    const loc = attraction.location as any
    if (loc?.coordinates) { lng = loc.coordinates[0]; lat = loc.coordinates[1] }
    else if (loc?.x !== undefined) { lng = loc.x; lat = loc.y }

    if (!lng || !lat) {
      return { hospitals: [], police: [], restaurants: [], atms: [], cafes: [], pharmacies: [] }
    }

    const results = await this.attractionRepo.manager.query(query, [lng, lat])
    return {
      hospitals:   results.filter((p: any) => p.category === 'hospital'),
      police:      results.filter((p: any) => p.category === 'police'),
      restaurants: results.filter((p: any) => p.category === 'restaurant'),
      atms:        results.filter((p: any) => p.category === 'atm'),
      cafes:       results.filter((p: any) => p.category === 'cafe'),
      pharmacies:  results.filter((p: any) => p.category === 'pharmacy'),
      all:         results,
    }
  }

  async findByCategory(category: string, limit = 10, offset = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { category, deleted_at: IsNull() } as any,
      order: { average_rating: 'DESC' },
      take: limit, skip: offset,
    })
    return { data, pagination: { total, limit, offset, pages: Math.ceil(total / limit) } }
  }

  async findByProvince(province_id: string, limit = 10, offset = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { province_id: parseInt(province_id), deleted_at: IsNull() } as any,
      order: { average_rating: 'DESC' },
      take: limit, skip: offset,
    })
    return { data, pagination: { total, limit, offset, pages: Math.ceil(total / limit) } }
  }

  async findTopRated(limit = 10) {
    return this.attractionRepo.find({
      where: { deleted_at: IsNull() } as any,
      order: { average_rating: 'DESC' },
      take: limit,
    })
  }

  async findById(id: string) {
    return this.attractionRepo.findOne({ where: { id, deleted_at: IsNull() } as any })
  }

  async create(dto: CreateAttractionDto) {
    const attraction = this.attractionRepo.create(dto)
    return this.attractionRepo.save(attraction)
  }

  async update(id: string, dto: Partial<CreateAttractionDto>) {
    const updateData: any = { ...dto }
    if (dto.province_id) updateData.province_id = parseInt(dto.province_id as any)
    await this.attractionRepo.update({ id }, updateData)
    return this.findById(id)
  }

  async delete(id: string) {
    const attraction = await this.attractionRepo.findOne({ where: { id } })
    if (attraction) return this.attractionRepo.softRemove(attraction)
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
      this.attractionRepo.count({ where: { deleted_at: IsNull() } as any }),
      this.attractionRepo.find({
        where: { deleted_at: IsNull() } as any,
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

  async seedTataiWaterfall() {
    const existing = await this.attractionRepo.findOne({
      where: { name_en: 'Tatai Waterfall', deleted_at: IsNull() } as any,
    })
    if (existing) return existing

    const province = await this.attractionRepo.manager.query(
      `SELECT id FROM provinces WHERE name_en ILIKE '%Koh Kong%' LIMIT 1`,
    )
    if (!province?.length) return null

    const attraction = this.attractionRepo.create({
      name_en: 'Tatai Waterfall',
      name_kh: 'ទឹកធ្លាក់តាតៃ',
      province_id: province[0].id,
      category: 'waterfall',
      is_hidden_gem: true,
      average_rating: 4.9,
      location: { type: 'Point', coordinates: [103.2, 11.6] },
    } as any)
    return this.attractionRepo.save(attraction)
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