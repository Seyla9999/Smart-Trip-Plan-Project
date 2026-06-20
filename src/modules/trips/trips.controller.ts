import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  Query,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

import { CreateTripDto, ItineraryItemDto } from './dto/create-trip.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @HttpCode(201)
  create(@Request() req, @Body() dto: CreateTripDto) {
    return this.tripsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.tripsService.findAll(req.user.id);
  }

  @Get('can-review/:attractionId')
  canReview(@Request() req, @Param('attractionId') attractionId: string) {
    return this.tripsService
      .canReview(attractionId, req.user.id)
      .then((allowed) => ({ allowed }));
  }

  @Get('invite/:token')
  @Public()
  getInvitePreview(@Param('token') token: string) {
    return this.tripsService.findByInviteToken(token);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @Put(':id/itinerary')
  updateItinerary(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateItineraryDto,
  ) {
    return this.tripsService.updateItinerary(id, req.user.id, dto);
  }

  // POST /api/trips/join/:token — join a trip via invite link
  // NOTE: this route MUST be before ':id' to avoid being caught by findOne
  @Post('join/:token')
  @HttpCode(200)
  join(@Request() req, @Param('token') token: string) {
    return this.tripsService.joinByToken(token, req.user.id);
  }

  // POST /api/trips/:id/itinerary-items — append one item to existing trip
  @Post(':id/itinerary-items')
  addItineraryItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ItineraryItemDto,
  ) {
    return this.tripsService.addItineraryItem(id, req.user.id, dto);
  }

  // PATCH /api/trips/:id/complete — mark trip as completed
  @Patch(':id/complete')
  complete(@Request() req, @Param('id') id: string) {
    return this.tripsService.complete(id, req.user.id);
  }

  // DELETE /api/trips/:id — delete trip (owner only)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tripsService.remove(id, req.user.id);
  }
}