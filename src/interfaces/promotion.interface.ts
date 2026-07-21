import type { Types } from 'mongoose';

export const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;
export type DiscountTypeType = (typeof DiscountType)[keyof typeof DiscountType];

export const PromotionAudience = {
  ALL: 'all',
  SPECIFIC: 'specific',
  NEW_CUSTOMERS: 'new_customers',
  LOYAL_CUSTOMERS: 'loyal_customers',
} as const;
export type PromotionAudienceType = (typeof PromotionAudience)[keyof typeof PromotionAudience];

export interface PromotionUsageLimit {
  perUser?: number;
  total?: number;
  currentUsage: number;
}

export interface PromotionApplicableUsers {
  type: PromotionAudienceType;
  users: Types.ObjectId[];
}

export interface PromotionUsageRecord {
  user: Types.ObjectId;
  booking: Types.ObjectId;
  usedAt: Date;
}

export interface IPromotion {
  readonly _id: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  discountType: DiscountTypeType;
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount: number;
  usageLimit: PromotionUsageLimit;
  applicableServices: Types.ObjectId[];
  applicableUsers: PromotionApplicableUsers;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usedBy: PromotionUsageRecord[];
  createdAt: Date;
  updatedAt: Date;
}
