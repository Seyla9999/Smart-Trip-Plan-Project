import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get()
  getAllProvinces() {
    return this.provincesService.getAllProvinces();
  }

  @Get(':id/attractions')
  getProvinceAttractions(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.getProvinceAttractions(id);
  }
}