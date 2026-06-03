import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
  @IsOptional()
  @IsString()
  place_id?: string;

  @IsOptional()
  @IsString()
  place_name?: string;

  @IsOptional()
  @IsString()
  place_type?: string;

  @IsOptional()
  @IsString()
  place_image_url?: string;

  @IsString()
  entity_type!: string;

  @IsUUID()
  entity_id!: string;
}
