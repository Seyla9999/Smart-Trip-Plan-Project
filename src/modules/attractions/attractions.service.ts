import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
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

  async findAll(filters?: any) {
    try {
      const parsedLimit = Number.parseInt(`${filters?.limit ?? ''}`, 10)
      const hasExplicitLimit = Number.isFinite(parsedLimit) && parsedLimit > 0
      const limit = hasExplicitLimit ? Math.min(parsedLimit, 100) : undefined

      const parsedOffset = Number.parseInt(`${filters?.offset ?? ''}`, 10)
      const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0
      const category = filters?.category
      const sortBy = filters?.sortBy || 'average_rating'
      const sortOrder = (filters?.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC'

      const query = this.attractionRepo.createQueryBuilder('attraction')

      if (category) {
        query.where('attraction.category = :category', { category })
      }

      // Map sort fields for backward compatibility
      let sortField = 'average_rating'
      if (sortBy === 'rating') sortField = 'average_rating'
      else if (sortBy === 'average_rating') sortField = 'average_rating'
      else if (sortBy === 'name') sortField = 'name_en'
      else if (sortBy === 'name_en') sortField = 'name_en'
      else if (sortBy === 'createdAt') sortField = 'created_at'
      else if (sortBy === 'created_at') sortField = 'created_at'

      query.orderBy(`attraction.${sortField}`, sortOrder)

      if (limit !== undefined) {
        query.skip(offset)
        query.take(limit)
      }

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

  async findByCategory(category: string, limit: number = 10, offset: number = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { category },
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
      where: { province_id: parseInt(province_id) },
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
      order: { average_rating: 'DESC' },
      take: limit,
    })
  }


  async findById(id: string) {
    return this.attractionRepo.findOne({
      where: { id },
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
    await this.attractionRepo.update({ id }, dto)
    return this.findById(id)
  }


  async delete(id: string) {
    return this.attractionRepo.delete({ id })
  }


  async getCategories() {
    const result = await this.attractionRepo
      .createQueryBuilder('attraction')
      .select('DISTINCT attraction.category', 'category')
      .getRawMany()

    return result.map((r) => r.category)
  }


  async getStatistics() {
    const [attractions, topRated, avgRating] = await Promise.all([
      this.attractionRepo.count(),
      this.attractionRepo.find({
        order: { average_rating: 'DESC' },
        take: 5,
      }),
      this.attractionRepo
        .createQueryBuilder('attraction')
        .select('AVG(attraction.average_rating)', 'average')
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
      rating: 'attraction.rating',
      name: 'attraction.name',
      createdAt: 'attraction.created_at',
      reviewCount: 'attraction.review_count',
      visitCount: 'attraction.visit_count',
    }
    return fieldMap[sortBy] || 'attraction.rating'
  }
}
