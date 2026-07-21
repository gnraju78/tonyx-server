export const Role = {
  CUSTOMER: 'customer',
  BARBER: 'barber',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: readonly UserRole[] = Object.values(Role);
