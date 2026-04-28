import { Controller, Get, Param } from '@nestjs/common';
import { AttractionsService } from './attractions.service';

@Controller('attractions')
export class AttractionsController {
  constructor(private readonly attractionsService: AttractionsService) {}

  // GET /attractions/seed/tatai - Seed Tatai Waterfall (for testing)
  @Get('seed/tatai')
  async seedTatai() {
    const attraction = await this.attractionsService.seedTataiWaterfall();
    return {
      success: true,
      message: 'Tatai Waterfall seeded successfully',
      data: attraction,
    };
  }

  // GET /attractions/tatai-waterfall - Get attraction details
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attractionsService.findOne(id);
  }
}
