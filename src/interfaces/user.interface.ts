import type { Types } from 'mongoose';
import type { AuditFields } from './base.interface.js';
import type { UserRole } from '../constants/roles.js';

export interface UserAvailabilitySlot {
  start: string;
  end: string;
}

export interface ProfileImage {
  public_id: string;
  url: string;
}

export interface UserRating {
  average: number;
  count: number;
}

export interface IUser extends AuditFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: ProfileImage;
  role: UserRole;
  isActive: boolean;
  bio?: string;
  specialization: string[];
  rating: UserRating;
  availability: Map<string, UserAvailabilitySlot[]>;
  totalEarnings: number;
  lastLogin?: Date;
  emailVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

/** Fields safe to expose over the API — excludes password/token fields. */
export interface PublicUser {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: ProfileImage;
  role: UserRole;
  bio?: string;
  specialization: string[];
  rating: UserRating;
  isActive: boolean;
}
