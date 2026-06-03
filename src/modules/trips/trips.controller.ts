import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll(
    @Query('ownerId') ownerId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.tripsService.findAll({ ownerId, limit, page });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createTrip(@Request() req, @Body() dto: CreateTripDto) {
    return this.tripsService.create(req.user.id, dto);
  }
}
