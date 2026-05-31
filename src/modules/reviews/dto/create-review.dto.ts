import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator'

export class CreateReviewDto {
  @IsUUID()
  attraction_id!: string

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number

  @IsString()
  comment!: string

  @IsString()
  @IsOptional()
  author_name?: string

  @IsString()
  @IsOptional()
  title?: string
}
