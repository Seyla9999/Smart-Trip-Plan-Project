import { ItineraryItemDto } from './create-trip.dto';

export class UpdateItineraryDto {
  destination?: string;
  start_date?: string;
  end_date?: string;
  travel_type?: string;
  itinerary_items: ItineraryItemDto[] | undefined;
}
