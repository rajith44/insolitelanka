export interface ItineraryItem {
  dayTitle: string;
  mainTitle: string;
  description: string;
  dayHighlights?: string;
  dayActivities?: string;
  fromCity?: string;
  toCity?: string;
  travelMileageKm?: number | null;
  destinationIds: string[];
  hotelIds: string[];
  imageUrls: string[];
  /** Existing media IDs from API (for edit) */
  image_media_ids?: number[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ExtraServiceItem {
  name: string;
  price: number;
}

export interface Tour {
  id: string;
  categoryIds: string[];
  categoryNames?: string[];
  title: string;
  slug: string;
  shortTitle: string;
  description: string;
  mainImageUrl: string;
  main_media_id?: number;
  imageUrls: string[];
  gallery_media_ids?: number[];
  pricePerPerson: number;
  duration: string;
  maxPeople: number;
  countryId: string;
  countryName?: string;
  included: string;
  excluded: string;
  highlights: string;
  mapEmbed: string;
  videoUrl: string;
  itinerary: ItineraryItem[];
  faq: FAQItem[];
  extraServices: ExtraServiceItem[];
  createdAt?: string;
  updatedAt?: string;
}
