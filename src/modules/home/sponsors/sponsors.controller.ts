// ============================================================
// SAVE AS: src/modules/home/sponsors/sponsors.controller.ts
// ============================================================
import { Controller, Get } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  // GET /sponsors
  @Get()
  findAll() {
    return this.service.findAllActive();
  }
}

// ============================================================
// SAVE AS: src/modules/home/sponsors/sponsors.module.ts
// ============================================================
