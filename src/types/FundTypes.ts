export interface FundQuote {
  name: string;
  marketCode: string;
  lastPrice: number;
  lastPriceDate: string;
  ongoingCharge: number;
  sectorName: string;
  currency: string;
}

export interface FundProfile {
  objective: string;
}

export interface FundRatings {
  analystRating: number;
  SRRI: number | null;
  analystRatingLabel: string;
}

export interface FundDocument {
  id: string;
  type: string;
  url: string;
}

export interface FundAsset {
  label: string;
  value: number;
}

export interface FundHolding {
  name: string;
  weighting: number;
}

export interface FundPortfolio {
  asset: FundAsset[];
  top10Holdings: FundHolding[];
}

export interface FundApiResponse {
  quote: FundQuote;
  profile: FundProfile;
  ratings: FundRatings;
  documents: FundDocument[];
  portfolio: FundPortfolio;
}
