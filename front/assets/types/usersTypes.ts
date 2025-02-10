export type User = {
  id: string;
  lastname: string;
  firstname: string;
  displayname: string;
  email: string;
  emailConfirmed: number;
  createdAt: string;
  updatedAt: string;
  Roles: Role[];
};

export type Role = {
  name: "administrator" | "moderator" | "user";
  createdAt: string;
  updatedAt: string;
};
