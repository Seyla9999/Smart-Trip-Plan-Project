import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly service: ProvincesService) {}

  // GET /provinces
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET /provinces/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
