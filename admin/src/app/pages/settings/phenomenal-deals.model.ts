export interface PhenomenalDealCardForm {
  imageUrl: string;
  label: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  offerBadge: string;
}

export interface PhenomenalDealsData {
  id: string;
  sectionBadge: string;
  sectionHeading: string;
  card1: PhenomenalDealCardForm;
  card2: PhenomenalDealCardForm;
  card3: PhenomenalDealCardForm;
  card4: PhenomenalDealCardForm;
}
