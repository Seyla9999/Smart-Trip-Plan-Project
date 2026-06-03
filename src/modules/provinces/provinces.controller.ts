import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly service: ProvincesService) {}

  // GET /provinces
  // GET /provinces?search=Battambang
  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  // GET /provinces/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { success: true, data };
  }
}
