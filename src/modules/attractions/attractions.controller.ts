import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { AttractionsService } from './attractions.service'
import { CreateAttractionDto } from './dto/create-attraction.dto'
import { UpdateAttractionDto } from './dto/update-attraction.dto'

@Controller('attractions')
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

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
 
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return this.attractionsService.findById(id)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getAttractions(@Query() filters?: any) {
    return this.attractionsService.findAll(filters || {})
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.attractionsService.create(dto)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttractionDto,
  ) {
    return this.attractionsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.attractionsService.delete(id)
  }
}
