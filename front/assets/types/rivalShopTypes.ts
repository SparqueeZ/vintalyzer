export interface RivalShop {
  name: string;
  content: string;
  date: string;
  rating: number;
  evaluationsCount: number; // Remplacer par reviews
  followers: number;
  globalRatings: Rating;
  location: string;
  autoRatings: Rating;
  membersRatings: Rating;
  ratingNumber: string;
}

export interface Rating {
  count: string;
  rating: string;
}

export interface RivalEvaluation {
  content: string;
  date: string;
  rating: string;
  language: string;
}

export interface RivalArticle {
  brand: string;
  likes: number;
  price: number;
  priceWithProtection: number;
  protectionFee: number;
}

export interface FullData {
  shop: RivalShop;
  evaluations: RivalEvaluation[];
  articles: RivalArticle[];
}
