import type { Types } from 'mongoose';
import type { AuditFields } from './base.interface.js';

export const ServiceCategory = {
  HAIRCUT: 'haircut',
  STYLING: 'styling',
  COLORING: 'coloring',
  TREATMENT: 'treatment',
  OTHER: 'other',
} as const;
export type ServiceCategoryType = (typeof ServiceCategory)[keyof typeof ServiceCategory];

export const SeniorityLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;
export type SeniorityLevelType = (typeof SeniorityLevel)[keyof typeof SeniorityLevel];

export interface ServiceImage {
  public_id: string;
  url: string;
}

export interface ServiceRequirements {
  minSeniorityLevel: SeniorityLevelType;
  tools: string[];
  products: string[];
}

export interface ServicePopularity {
  bookingCount: number;
  averageRating: number;
}

export interface IService extends AuditFields {
  name: string;
  description: string;
  category: ServiceCategoryType;
  basePrice: number;
  duration: number;
  image?: ServiceImage;
  isActive: boolean;
  barberSpecialists: Types.ObjectId[];
  discountPercentage: number;
  requirements: ServiceRequirements;
  popularity: ServicePopularity;
  tags: string[];
}
