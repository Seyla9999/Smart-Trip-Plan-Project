import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Trip } from './trip.entity'
import { TripMember } from './trip-member.entity'
import { ItineraryItem } from './itinerary-item.entity'
import { PackingListItem } from './packing-list-item.entity'
import { CreateTripDto } from './dto/create-trip.dto'
import { randomBytes } from 'crypto'

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

  async create(userId: string, dto: CreateTripDto) {
    const token = randomBytes(16).toString('hex')

    const trip = this.tripRepo.create({
      title: dto.title,
      description: dto.description,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      owner_id: userId,
      invite_token: token,
    } as Partial<Trip>)

    const saved = await this.tripRepo.save(trip)

    const member = this.memberRepo.create({
      trip_id: saved.id,
      user_id: userId,
      role: 'owner',
    } as Partial<TripMember>)

    await this.memberRepo.save(member)

    return this.tripRepo.findOne({ where: { id: saved.id } })
  }
}
