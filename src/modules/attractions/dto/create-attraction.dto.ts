import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator'

export class CreateAttractionDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  province_id!: string

  @IsString()
  category!: string

  @IsOptional()
  @IsArray()
  sub_categories?: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsString()
  image_url?: string

  @IsOptional()
  @IsString()
  opening_hours?: string

  @IsOptional()
  @IsNumber()
  entrance_fee?: number

  @IsOptional()
  @IsArray()
  amenities?: string[]
}
