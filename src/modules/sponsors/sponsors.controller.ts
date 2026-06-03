import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Get()
  findAll() {
    return this.service.findAllActive();
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) {
    return this.service.create(data);
  }
}
