export interface TourCategory {
  id: string;
  parentId?: string | null;
  parentTitle?: string;
  title: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  media_id?: number;
  createdAt?: string;
  updatedAt?: string;
}
