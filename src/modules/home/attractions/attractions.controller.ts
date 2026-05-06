import { Controller, Get, Param, Query } from '@nestjs/common';
import { AttractionsService } from './attractions.service';

@Controller('attractions')
export class AttractionsController {
  constructor(private readonly service: AttractionsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('province') province?: string,
    @Query('province_id') province_id?: number,
    @Query('is_hidden_gem') is_hidden_gem?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.service.findAll({
      category,
      province,
      province_id,
      is_hidden_gem,
      search,
      limit,
      page,
    });
  }

  @Get('hidden-gems')
  findHiddenGems(@Query('limit') limit?: number) {
    return this.service.findHiddenGems(Number(limit) || 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
