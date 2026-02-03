export interface Country {
  id: string;
  name: string;
}

export interface DestinationHighlight {
  imageUrl: string;
  shortDescription: string;
  media_id?: number;
}

export interface Destination {
  id: string;
  title: string;
  slug: string;
  countryId: string;
  countryName?: string;
  mainDescription: string;
  subTitle: string;
  subDescription: string;
  destinationHighlights: DestinationHighlight[];
  mainImageUrl: string;
  main_media_id?: number;
  imageUrls: string[];
  gallery_media_ids?: number[];
  createdAt?: string;
  updatedAt?: string;
}
