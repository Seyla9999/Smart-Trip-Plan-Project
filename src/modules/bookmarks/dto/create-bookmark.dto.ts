export class CreateBookmarkDto {
  place_id!: string;
  place_name?: string;
  place_type?: string;
  place_image_url?: string;
  entity_type!: string;
  entity_id!: string;
}
