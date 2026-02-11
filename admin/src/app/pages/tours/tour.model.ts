export interface ItineraryItem {
  dayTitle: string;
  mainTitle: string;
  description: string;
  dayHighlights?: string;
  dayActivities?: string;
  fromCity?: string;
  toCity?: string;
  travelMileageKm?: number | null;
  walkingTime?: string;
  mealsIncluded?: string[];
  elevationGain?: string;
  elevationLoss?: string;
  distanceCovered?: string;
  transfer?: string;
  activity?: string[];
  destinationIds: string[];
  hotelIds: string[];
  imageUrls: string[];
  /** Existing media IDs from API (for edit) */
  image_media_ids?: number[];
}

/** Options for Meals included multi-select */
export const ITINERARY_MEALS_OPTIONS = [
  { id: 'Breakfast', name: 'Breakfast' },
  { id: 'Lunch', name: 'Lunch' },
  { id: 'Dinner', name: 'Dinner' },
];

/** Options for Activity multi-select */
export const ITINERARY_ACTIVITY_OPTIONS = [
  { id: 'Hiking', name: 'Hiking' },
  { id: 'Trekking', name: 'Trekking' },
  { id: 'Safari', name: 'Safari' },
  { id: 'Cultural visit', name: 'Cultural visit' },
  { id: 'Beach', name: 'Beach' },
  { id: 'Transfer', name: 'Transfer' },
  { id: 'Sightseeing', name: 'Sightseeing' },
  { id: 'Wildlife', name: 'Wildlife' },
];

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
