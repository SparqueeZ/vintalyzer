export type FullShop = {
  id: number;
  name: string;
  location: Location;
  email: string;
  subscribers: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  sales: Sale[];
  comments: Comment[];
  expenses: Expense[];
};

export type Shop = {
  name: string;
  location: Location;
  email: string;
  subscribers: number;
};

export type Location = {
  country: string;
  city: string;
};

export type Sale = {
  article: string;
  price: number;
  brand: string;
  date: string;
};

export type Comment = {
  author: string;
  content: string;
  lang: string;
  relativeDate: string;
};

export type Expense = {
  article: string;
  montant: number;
  date: string;
  type: string;
};

export type Statistics = {
  conversionRate: number;
  salesByBrandWithoutGroup: BrandStats[];
  totalSales: number;
  totalSalesPrice: number;
  totalViews: number;
};

export type BrandStats = {
  brand: string;
  sales: Sale[];
  totalPrice: number;
  totalViews: number;
  count: number;
};
