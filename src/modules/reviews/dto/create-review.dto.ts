export class CreateReviewDto {
  attraction_id!: string;
  rating!: number;
  comment!: string;
  author_name?: string;
  title?: string;
}
