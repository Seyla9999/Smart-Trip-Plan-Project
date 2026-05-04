import { Controller, Get } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Get()
  findAll() {
    return this.service.findAllActive();
  }
}
