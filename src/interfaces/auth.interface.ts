import type { Types } from 'mongoose';
import type { UserRole } from '../constants/roles.js';

export interface AuthUser {
  readonly id: Types.ObjectId;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
}

export interface JwtPayload {
  readonly id: string;
  readonly iat: number;
}
