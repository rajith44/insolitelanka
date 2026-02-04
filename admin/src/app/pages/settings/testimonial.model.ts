export interface TestimonialSection {
  id: string;
  sectionBadge: string;
  sectionHeading: string;
}

export interface Testimonial {
  id: string;
  personName: string;
  country: string;
  date: string;
  personComment: string;
  personRating: number[];
  sortOrder: number;
}
