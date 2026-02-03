export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrls: string[];
  highlights: string;
  priceRangeMin: number;
  priceRangeMax: number;
  star: number;
  main_media_id?: number;
  gallery_media_ids?: number[];
  createdAt?: string;
  updatedAt?: string;
}
