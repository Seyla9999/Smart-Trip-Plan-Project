import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';

import { Trip } from './trip.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';
import { PackingListItem } from './packing-list-item.entity';

import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { TogglePackingDto } from './dto/toggle-packing.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,

    @InjectRepository(TripMember)
    private memberRepo: Repository<TripMember>,

    @InjectRepository(ItineraryItem)
    private itineraryRepo: Repository<ItineraryItem>,

    @InjectRepository(PackingListItem)
    private packingRepo: Repository<PackingListItem>,

    // DataSource is used for transactions
    private dataSource: DataSource,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Verify that the user is a member of the trip. Throws 404 or 403. */
  private async assertMember(tripId: string, userId: string): Promise<Trip> {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['members', 'itinerary_items', 'packing_list'],
    });
    if (!trip) throw new NotFoundException('Trip not found');

    const isMember = trip.members.some((m) => m.user_id === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this trip');

    return trip;
  }

  /** Verify that the user is the owner. Throws 404 or 403. */
  private async assertOwner(tripId: string, userId: string): Promise<Trip> {
    const trip = await this.assertMember(tripId, userId);
    const isOwner = trip.members.some(
      (m) => m.user_id === userId && m.role === 'owner',
    );
    if (!isOwner) throw new ForbiddenException('Only the trip owner can do this');
    return trip;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateTripDto): Promise<Trip | null> {
    const token = randomBytes(16).toString('hex');

    const trip = this.tripRepo.create({
      title:        dto.title,
      description:  dto.description,
      destination:  dto.destination,
      start_date:   dto.start_date ? new Date(dto.start_date) : null,
      end_date:     dto.end_date   ? new Date(dto.end_date)   : null,
      owner_id:     userId,
      invite_token: token,
    } as Partial<Trip>);

    const saved = await this.tripRepo.save(trip);

    // Add owner as member
    await this.memberRepo.save(
      this.memberRepo.create({
        trip_id: saved.id,
        user_id: userId,
        role:    'owner',
      } as Partial<TripMember>),
    );

    // Save itinerary items if provided (from attraction schedule)
    if (dto.itinerary_items?.length) {
      const items = dto.itinerary_items.map((item, idx) =>
        this.itineraryRepo.create({
          trip_id:     saved.id,
          trip:        saved,
          day_index:   item.day_index  ?? 0,
          title:       item.title      ?? '',
          location:    item.location   ?? '',
          description: item.description ?? '',
          start_time:  item.start_time ?? '',
        } as Partial<ItineraryItem>),
      );
      await this.itineraryRepo.save(items);
    }

    // Legacy: locations array (keep backward compat)
    if (!dto.itinerary_items?.length && dto.locations?.length) {
      const items = dto.locations.map((loc) =>
        this.itineraryRepo.create({
          trip: saved,
          title: loc.name,
        } as Partial<ItineraryItem>),
      );
      await this.itineraryRepo.save(items);
    }

    return this.tripRepo.findOne({
      where: { id: saved.id },
      relations: ['members', 'itinerary_items', 'packing_list'],
    });
  }

  // ─── Find All (for current user) ─────────────────────────────────────────

  async findAll(userId: string): Promise<Trip[]> {
    return this.tripRepo
      .createQueryBuilder('trip')
      .innerJoin('trip.members', 'member', 'member.user_id = :userId', { userId })
      .leftJoinAndSelect('trip.members', 'allMembers')
      .leftJoinAndSelect('trip.itinerary_items', 'items')
      .leftJoinAndSelect('trip.packing_list', 'packing')
      .orderBy('trip.created_at', 'DESC')
      .addOrderBy('items.day_index', 'ASC')
      .getMany();
  }

  async findOne(tripId: string, userId: string): Promise<Trip> {
    return this.assertMember(tripId, userId);
  }

  async updateItinerary(
    tripId: string,
    userId: string,
    dto: UpdateItineraryDto,
  ): Promise<Trip | null> {
    await this.assertMember(tripId, userId);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(ItineraryItem, { trip_id: tripId });

      if (dto.itinerary_items?.length) {
        const items = dto.itinerary_items.map((item) =>
          manager.create(ItineraryItem, {
            trip_id:     tripId,
            day_index:   item.day_index  ?? 0,
            title:       item.title      ?? '',
            location:    item.location   ?? '',
            description: item.description ?? '',
            start_time:  item.start_time ?? '',
          } as Partial<ItineraryItem>),
        );
        await manager.save(ItineraryItem, items);
      }

      const patch: Partial<Trip> = { updated_at: new Date() };
      if (dto.start_date)  patch.start_date  = new Date(dto.start_date);
      if (dto.end_date)    patch.end_date    = new Date(dto.end_date);
      if (dto.destination) patch.destination = dto.destination;
      await manager.update(Trip, tripId, patch);
    });

    return this.tripRepo.findOne({
      where: { id: tripId },
      relations: ['members', 'itinerary_items', 'packing_list'],
      order: { itinerary_items: { day_index: 'ASC' } },
    });
  }

  async joinByToken(token: string, userId: string): Promise<Trip | null> {
    const trip = await this.tripRepo.findOne({
      where: { invite_token: token },
      relations: ['members'],
    });
    if (!trip) return null;

    const already = trip.members.some((m) => m.user_id === userId);
    if (!already) {
      await this.memberRepo.save(
        this.memberRepo.create({
          trip_id: trip.id,
          user_id: userId,
          role: 'member',
        } as Partial<TripMember>),
      );
    }
    return this.tripRepo.findOne({
      where: { id: trip.id },
      relations: ['members', 'itinerary_items', 'packing_list'],
    });
  }

  async togglePacking(
    tripId: string,
    itemId: string,
    userId: string,
  ): Promise<PackingListItem> {
    await this.assertMember(tripId, userId);

    const item = await this.packingRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Packing item not found');

    item.packed = !item.packed;
    return this.packingRepo.save(item);
  }

  // ─── Delete Trip ──────────────────────────────────────────────────────────

  async remove(tripId: string, userId: string): Promise<{ message: string }> {
    await this.assertOwner(tripId, userId);
    await this.tripRepo.delete(tripId);
    return { message: 'Trip deleted successfully' };
  }
}