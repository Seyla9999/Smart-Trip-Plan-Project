import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateAttractionDto {
  @IsOptional()
  @IsNumber()
  province_id?: number;

  @IsString()
  name_en!: string;

  @IsOptional()
  @IsString()
  name_kh?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  is_hidden_gem?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  average_rating?: number;

  @IsOptional()
  @IsString()
  hero_image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsObject()
  nearby_images?: object;

  @IsOptional()
  @IsString()
  image_url?: string;
}
