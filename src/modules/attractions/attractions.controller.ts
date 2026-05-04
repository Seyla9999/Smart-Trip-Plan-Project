import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AttractionsService } from './attractions.service'
import { FilterAttractionsDto } from './dto/filter-attractions.dto'
import { CreateAttractionDto } from './dto/create-attraction.dto'

@Controller('attractions')
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

 
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAttractions(@Query() filters: FilterAttractionsDto) {
    return this.attractionsService.findAll(filters)
  }


  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.attractionsService.findByCategory(
      category,
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    )
  }


  @Get('province/:province_id')
  @HttpCode(HttpStatus.OK)
  async getByProvince(
    @Param('province_id') province_id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.attractionsService.findByProvince(
      province_id,
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    )
  }


  @Get('top-rated')
  @HttpCode(HttpStatus.OK)
  async getTopRated(@Query('limit') limit?: string) {
    return this.attractionsService.findTopRated(limit ? parseInt(limit) : 10)
  }


  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    const categories = await this.attractionsService.getCategories()
    return { categories }
  }


  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    return this.attractionsService.getStatistics()
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return this.attractionsService.findById(id)
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttractionDto) {
    return this.attractionsService.create(dto)
  }
}
