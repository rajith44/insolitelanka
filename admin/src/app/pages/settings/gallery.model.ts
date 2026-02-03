export interface GalleryItem {
  id: string;
  media_id: number;
  imageUrl: string | null;
  sortOrder: number;
  createdAt?: string;
}
