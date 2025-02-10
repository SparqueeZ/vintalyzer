type Product = {
  id: string;
  name: string;
  price: number;
  author: string;
  category: string;
  visible: boolean;
  authorId: string;
};

import type { User, Role } from "../types/usersTypes";

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: User, data: Permissions[Key]["dataType"]) => boolean);

type RolesWithPermissions = {
  [R in Role as string]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
    }>;
  }>;
};

type Permissions = {
  products: {
    dataType: Product;
    action: "view" | "update" | "delete" | "create";
  };
  users: {
    dataType: User;
    action: "view" | "update" | "delete" | "create";
  };
};

const ROLES = {
  administrator: {
    products: {
      view: true,
      update: true,
      delete: true,
      create: true,
    },
    users: {
      view: true,
      update: true,
      delete: true,
      create: true,
    },
  },
  moderator: {
    products: {
      view: true,
      update: true,
      delete: true,
      create: false,
    },
    users: {
      view: true,
      update: true,
      delete: true,
      create: false,
    },
  },
  user: {
    products: {
      view: true,
      update: (user: User, product: Product) => user.id === product.authorId,
      delete: (user: User, product: Product) => user.id === product.authorId,
      create: true,
    },
    users: {
      view: false,
      update: false,
      delete: false,
      create: false,
    },
  },
} as const satisfies RolesWithPermissions;

export function hasPermission<Resource extends keyof Permissions>(
  user: User,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"]
) {
  console.log(user.Roles);
  if (!user.Roles) return false;
  return user.Roles.some((role) => {
    const roleName = role.name as unknown as Role;
    const permission = (ROLES as RolesWithPermissions)[roleName][resource]?.[
      action
    ];
    if (permission == null) return false;

    if (typeof permission === "boolean") return permission;
    return data != null && permission(user, data);
  });
}
