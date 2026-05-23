export class ItineraryItemDto {
  day_index?:   number;
  title!:       string;
  location?:    string;
  description?: string;
  start_time?:  string;
  place_id?:    string;
}

export class CreateTripDto {
  title!:        string;
  description?:  string;
  destination?:  string;
  origin?:       string;
  start_date?:   string;
  end_date?:     string;
  travel_type?:  string;
  itinerary_items?: ItineraryItemDto[];
  locations?: { lat: number; lng: number; name: string }[];
}