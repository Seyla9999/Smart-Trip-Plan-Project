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

  async findAll(filters: FilterAttractionsDto) {
    let query = this.attractionRepo.createQueryBuilder('attraction')

    if (filters.search) {
      const searchTerm = `%${filters.search}%`
      query = query.where(
        '(attraction.name ILIKE :search OR attraction.description ILIKE :search)',
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
      query = query.andWhere('attraction.rating >= :minRating', {
        minRating: filters.minRating,
      })
    }

    if (filters.maxRating !== undefined) {
      query = query.andWhere('attraction.rating <= :maxRating', {
        maxRating: filters.maxRating,
      })
    }

    if (filters.province_id) {
      query = query.andWhere('attraction.province_id = :province_id', {
        province_id: filters.province_id,
      })
    }

    if (filters.isOpen !== undefined) {
      query = query.andWhere('attraction.is_open = :isOpen', {
        isOpen: filters.isOpen,
      })
    }

    if (filters.maxEntryFee !== undefined) {
      query = query.andWhere('attraction.entrance_fee <= :maxEntryFee', {
        maxEntryFee: filters.maxEntryFee,
      })
    }

    if (filters.amenities && filters.amenities.length > 0) {
      for (const amenity of filters.amenities) {
        query = query.andWhere(':amenity = ANY(attraction.amenities)', {
          amenity,
        })
      }
    }

    // query = query.andWhere('attraction.status = :status', {
    //   status: 'active',
    // })

    const sortField = this.getSortField(filters.sortBy || 'rating')
    const sortOrder = filters.sortOrder || 'DESC'
    query = query.orderBy(sortField, sortOrder)

    const skip = filters.offset || 0
    const take = filters.limit || 10
    query = query.skip(skip).take(take)

    const total = await query.getCount()

    const data = await query.getMany()

    return {
      data,
      pagination: {
        total,
        limit: take,
        offset: skip,
        pages: Math.ceil(total / take),
      },
    }
  }

  async findByCategory(category: string, limit: number = 10, offset: number = 0) {
    const [data, total] = await this.attractionRepo.findAndCount({
      where: { category, status: 'active' },
      order: { rating: 'DESC' },
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
      where: { province_id, status: 'active' },
      order: { rating: 'DESC' },
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
      where: { status: 'active', is_open: true },
      order: { rating: 'DESC' },
      take: limit,
    })
  }


  async findById(id: string) {
    return this.attractionRepo.findOne({
      where: { id, status: 'active' },
    })
  }


  async create(dto: CreateAttractionDto) {
    const attraction = this.attractionRepo.create(dto)
    return this.attractionRepo.save(attraction)
  }

  async update(id: string, dto: Partial<CreateAttractionDto>) {
    await this.attractionRepo.update({ id }, dto)
    return this.findById(id)
  }


  async delete(id: string) {
    return this.attractionRepo.update(
      { id },
      { status: 'inactive', updated_at: new Date() },
    )
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
      this.attractionRepo.count({ where: { status: 'active' } }),
      this.attractionRepo.find({
        where: { status: 'active' },
        order: { rating: 'DESC' },
        take: 5,
      }),
      this.attractionRepo
        .createQueryBuilder('attraction')
        .select('AVG(attraction.rating)', 'average')
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
