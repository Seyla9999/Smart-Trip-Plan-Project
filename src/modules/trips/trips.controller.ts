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
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

import { CreateTripDto, ItineraryItemDto } from './dto/create-trip.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Controller('api/trips')
@UseGuards(JwtAuthGuard)          // all routes require a valid JWT
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // POST /api/trips — create a new trip
  @Post()
  @HttpCode(201)
  create(@Request() req, @Body() dto: CreateTripDto) {
    return this.tripsService.create(req.user.id, dto);
  }

  // GET /api/trips — list all trips for the logged-in user
  @Get()
  findAll(@Request() req) {
    return this.tripsService.findAll(req.user.id);
  }

  // GET /api/trips/can-review/:attractionId — check if user can review this attraction
  // NOTE: MUST be declared before ':id' to avoid NestJS matching "can-review" as an id
  @Get('can-review/:attractionId')
  canReview(@Request() req, @Param('attractionId') attractionId: string) {
    return this.tripsService
      .canReview(attractionId, req.user.id)
      .then((allowed) => ({ allowed }));
  }

  // GET /api/trips/:id — get a single trip (members only)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tripsService.findOne(id, req.user.id);
  }

  // PUT /api/trips/:id/itinerary — replace all itinerary items (Save Plan)
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

  @Get('invite/:token')
  @Public()
  getInvitePreview(@Param('token') token: string) {
    return this.tripsService.findByInviteToken(token);
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

  // PATCH /api/trips/:id/packing/:itemId/toggle — toggle a packing list item
  @Patch(':id/packing/:itemId/toggle')
  togglePacking(
    @Request() req,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.tripsService.togglePacking(id, itemId, req.user.id);
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