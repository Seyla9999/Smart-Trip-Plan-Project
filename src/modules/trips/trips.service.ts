import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';

import { Trip } from './trip.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';
import { PackingListItem } from './packing-list-item.entity';
import { Province } from '../provinces/province.entity';

import { CreateTripDto, ItineraryItemDto } from './dto/create-trip.dto';
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

  private attachDerivedProvince(trip: Trip | null): Trip | null {
    if (!trip) return null;

    const derivedProvince =
      trip.itinerary_items
        ?.map((item) => item.attraction?.province)
        .find((province): province is Province => Boolean(province)) ?? null;

    trip.province = derivedProvince ?? undefined;
    return trip;
  }

  /** Verify that the user is a member of the trip. Throws 404 or 403. */
  private async assertMember(tripId: string, userId: string): Promise<Trip> {
    const trip = await this.tripRepo.findOne({
      where: { id: tripId },
      relations: {
        members: true,
        itinerary_items: {
          attraction: {
            province: true,
          },
        },
        packing_list: true,
      },
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

  private buildItineraryItemPayload(
    tripId: string,
    item: NonNullable<CreateTripDto['itinerary_items']>[number],
    fallbackSortOrder: number,
  ) {
    const normalizeTime = (value?: string) => {
      if (value === undefined || value === null) return undefined;
      const trimmed = String(value).trim();
      return trimmed === '' ? undefined : trimmed;
    };

    const dayIndex = item.day_number != null
      ? item.day_number - 1          // day_number is 1-based from the DTO → convert to 0-based
      : (item.day_index ?? 0)

    return {
      trip_id: tripId,
      day_index: dayIndex,
      attraction_id: item.attraction_id ?? undefined,
      sort_order: item.sort_order ?? fallbackSortOrder,
      start_time: normalizeTime(item.start_time),
      end_time: normalizeTime(item.end_time),
      notes: item.notes ?? item.description ?? item.title ?? undefined,
    };
  }

  async create(userId: string, dto: CreateTripDto): Promise<Trip | null> {
    const token = randomUUID();

    const trip = this.tripRepo.create({
      title: dto.title,
      description: dto.description,
      destination: dto.destination,
      origin: dto.origin,
      travel_type: dto.travel_type,
      ai_summary: dto.ai_summary,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      owner_id: userId,
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
        this.itineraryRepo.create(
          this.buildItineraryItemPayload(saved.id, item, idx),
        ),
      );
      await this.itineraryRepo.save(items);
    }

    return this.tripRepo.findOne({
      where: { id: saved.id },
      relations: {
        members: true,
        itinerary_items: {
          attraction: {
            province: true,
          },
        },
        packing_list: true,
      },
    }).then((trip) => this.attachDerivedProvince(trip));
  }

  // ─── Find All (for current user) ─────────────────────────────────────────

  async findAll(userId: string): Promise<Trip[]> {
    return this.tripRepo
      .createQueryBuilder('trip')
      .innerJoin('trip.members', 'member', 'member.user_id = :userId', { userId })
      .leftJoinAndSelect('trip.members', 'allMembers')
      .leftJoinAndSelect('trip.itinerary_items', 'items')
      .leftJoinAndSelect('items.attraction', 'attraction')
      .leftJoinAndSelect('attraction.province', 'attractionProvince')
      .leftJoinAndSelect('trip.packing_list', 'packing')
      .orderBy('trip.created_at', 'DESC')
      .addOrderBy('items.day_index', 'ASC')
      .getMany()
      .then((trips) => trips.map((trip) => this.attachDerivedProvince(trip) as Trip));
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
        const items = dto.itinerary_items.map((item, idx) =>
          manager.create(
            ItineraryItem,
            this.buildItineraryItemPayload(tripId, item, idx),
          ),
        );
        await manager.save(ItineraryItem, items);
      }

      const patch: Partial<Trip> = { updated_at: new Date() };
      if (dto.title !== undefined) patch.title = dto.title;
      if (dto.description !== undefined) patch.description = dto.description;
      if (dto.start_date)  patch.start_date  = new Date(dto.start_date);
      if (dto.end_date)    patch.end_date    = new Date(dto.end_date);
      if (dto.destination) patch.destination = dto.destination;
      if (dto.origin !== undefined) patch.origin = dto.origin;
      if (dto.travel_type !== undefined) patch.travel_type = dto.travel_type;
      if (dto.ai_summary !== undefined) patch.ai_summary = dto.ai_summary;
      await manager.update(Trip, tripId, patch);
    });

    return this.tripRepo.findOne({
      where: { id: tripId },
      relations: {
        members: true,
        itinerary_items: {
          attraction: {
            province: true,
          },
        },
        packing_list: true,
      },
      order: { itinerary_items: { day_index: 'ASC' } },
    }).then((trip) => this.attachDerivedProvince(trip));
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
      relations: {
        members: true,
        itinerary_items: {
          attraction: {
            province: true,
          },
        },
        packing_list: true,
      },
    }).then((trip) => this.attachDerivedProvince(trip));
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

  // ─── Append a single item to an existing trip ────────────────────────────

  async addItineraryItem(
    tripId: string,
    userId: string,
    item: ItineraryItemDto,
  ): Promise<ItineraryItem> {
    await this.assertMember(tripId, userId);

    const newItem = this.itineraryRepo.create({
      trip_id:      tripId,
      day_index:    (item.day_number ?? 1) - 1,
      attraction_id: item.attraction_id ?? undefined,
      sort_order:   item.sort_order ?? 0,
      notes:        item.notes ?? item.description ?? item.title ?? undefined,
      start_time:   item.start_time ?? undefined,
      end_time:     item.end_time   ?? undefined,
    } as Partial<ItineraryItem>);

    return this.itineraryRepo.save(newItem);
  }

  // ─── Mark trip as completed ───────────────────────────────────────────────

  async complete(tripId: string, userId: string): Promise<Trip | null> {
    await this.assertMember(tripId, userId);
    await this.tripRepo.update(tripId, { status: 'completed', updated_at: new Date() });
    return this.tripRepo.findOne({
      where: { id: tripId },
      relations: {
        members: true,
        itinerary_items: { attraction: { province: true } },
        packing_list: true,
      },
    }).then((trip) => this.attachDerivedProvince(trip));
  }

  /** Returns true if the user has ≥1 completed trip that includes the given attraction. */
  async canReview(attractionId: string, userId: string): Promise<boolean> {
    const count = await this.tripRepo
      .createQueryBuilder('trip')
      .innerJoin('trip.members', 'member', 'member.user_id = :userId', { userId })
      .innerJoin('trip.itinerary_items', 'item', 'item.attraction_id = :attractionId', { attractionId })
      .where('trip.status = :status', { status: 'completed' })
      .getCount();
    return count > 0;
  }

  // ─── Delete Trip ──────────────────────────────────────────────────────────

  async remove(tripId: string, userId: string): Promise<{ message: string }> {
    await this.assertOwner(tripId, userId);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PackingListItem, { trip_id: tripId });
      await manager.delete(ItineraryItem,   { trip_id: tripId });
      await manager.delete(TripMember,      { trip_id: tripId });
      await manager.delete(Trip,            tripId);
    });
    return { message: 'Trip deleted successfully' };
  }
}