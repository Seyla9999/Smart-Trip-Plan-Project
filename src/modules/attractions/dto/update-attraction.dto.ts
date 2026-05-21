import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class UpdateAttractionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsOptional()
  @IsString()
  name_kh?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  sub_categories?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  average_rating?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  hero_image?: string;

  @IsOptional()
  @IsNumber()
  province_id?: number;

  @IsOptional()
  @IsBoolean()
  is_hidden_gem?: boolean;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsObject()
  nearby_images?: object;

  @IsOptional()
  @IsString()
  opening_hours?: string;

  @IsOptional()
  @IsNumber()
  entrance_fee?: number;

  @IsOptional()
  @IsArray()
  amenities?: string[];
}
