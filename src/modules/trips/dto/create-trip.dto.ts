import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDefined,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

const normalizeBlankString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class ItineraryItemDto {
  @IsOptional()
  @Type(() => Number)
  day_index?: number;

  @IsOptional()
  @Type(() => Number)
  day_number?: number;

  @IsOptional()
  @IsString()
  attraction_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(normalizeBlankString)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  start_time?: string;

  @IsOptional()
  @Transform(normalizeBlankString)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  end_time?: string;

  @IsOptional()
  @IsString()
  place_id?: string;

  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTripDto {
  @IsDefined()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  travel_type?: string;

  @IsOptional()
  @IsString()
  ai_summary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryItemDto)
  itinerary_items?: ItineraryItemDto[];
}
