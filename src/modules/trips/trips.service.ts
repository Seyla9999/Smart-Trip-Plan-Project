import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { TripMember } from './trip-member.entity';
import { ItineraryItem } from './itinerary-item.entity';
import { PackingListItem } from './packing-list-item.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { randomBytes } from 'crypto';

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
  ) {}

  async findAll(q: { ownerId?: string; limit?: number; page?: number }) {
    const limit = Number(q.limit) || 10;
    const page = Number(q.page) || 1;
    const skip = (page - 1) * limit;

    const findOptions: any = {
      where: { deleted_at: null },
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    };

    if (q.ownerId) {
      findOptions.where = { ...findOptions.where, owner_id: q.ownerId };
    }

    const [data, total] = await this.tripRepo.findAndCount(findOptions);

    return {
      success: true,
      data,
      meta: { total: Number(total), page, limit },
    };
  }

  async create(userId: string, dto: CreateTripDto) {
    const token = randomBytes(16).toString('hex');

    const tripData: Partial<Trip> = {
      title: dto.title,
      description: dto.description,
      destination: dto.destination,
      start_date: dto.start_date ? new Date(dto.start_date) : undefined,
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      owner_id: userId,
      invite_token: token,
      status: 'planning'
    };

    const trip = this.tripRepo.create(tripData);
    const saved = await this.tripRepo.save(trip);

    const member = this.memberRepo.create({
      trip_id: saved.id,
      user_id: userId,
      role: 'owner',
    } as any);

    await this.memberRepo.save(member);

    if (dto.locations && dto.locations.length > 0) {
      const itineraryItems = dto.locations.map((loc) => {
        return this.itineraryRepo.create({
          trip_id: saved.id,
          title: loc.name,
        });
      });

      await this.itineraryRepo.save(itineraryItems);
    }

    return this.tripRepo.findOne({
      where: { id: saved.id },
    });
  }
}
