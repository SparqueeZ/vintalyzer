export type User = {
  id: string;
  lastname: string;
  firstname: string;
  displayname: string;
  email: string;
  emailConfirmed: number;
  createdAt: string;
  updatedAt: string;
  Subscription: Subscription;
  Roles: Role[];
};

export type Role = {
  name: "administrator" | "moderator" | "user";
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  name: string;
  plan: string;
  price: number;
  frequency: string;
  link: string;
  startDate: string;
  endDate: string;
  advantages: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};
