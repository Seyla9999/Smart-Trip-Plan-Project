import { IsOptional, IsString, IsNumber, Min, Max, IsIn, IsArray } from 'class-validator'
import { Type } from 'class-transformer'

export class FilterAttractionsDto {
  @IsOptional()
  @IsString()
  search?: string 

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsArray()
  @Type(() => String)
  categories?: string[] 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  maxRating?: number 

  @IsOptional()
  @IsString()
  province_id?: string 

  @IsOptional()
  @IsString()
  @IsIn(['Nature', 'Culture', 'Adventure', 'Historical', 'Religious', 'Urban', 'Beach', 'Culinary', 'Eco-Tourism'])
  mainCategory?: string

  @IsOptional()
  @IsArray()
  @Type(() => String)
  amenities?: string[] 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxEntryFee?: number 

  @IsOptional()
  @Type(() => Boolean)
  isOpen?: boolean 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number

  @IsOptional()
  @IsString()
  @IsIn(['rating', 'average_rating', 'name', 'name_en', 'name_kh', 'createdAt', 'created_at', 'reviewCount', 'visitCount'])
  sortBy?: string

  @IsOptional()
  @IsString()
  @IsIn(['DESC', 'ASC'])
  sortOrder?: 'DESC' | 'ASC'
}
