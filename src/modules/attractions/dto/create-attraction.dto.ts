import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator'

export class CreateAttractionDto {
  @IsNumber()
  province_id!: number

  @IsOptional()
  @IsString()
  name_en?: string

  @IsOptional()
  @IsString()
  name_kh?: string

  @IsString()
  category!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsBoolean()
  is_hidden_gem?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  average_rating?: number
}
