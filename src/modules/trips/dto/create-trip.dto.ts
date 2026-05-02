import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateTripDto {
  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string
}
