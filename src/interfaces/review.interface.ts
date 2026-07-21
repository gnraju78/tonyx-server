import type { Types } from 'mongoose';

export interface ReviewAspectRatings {
  professionalism?: number;
  cleanliness?: number;
  communication?: number;
  value?: number;
}

export interface ReviewImage {
  public_id: string;
  url: string;
}

export interface ReviewResponse {
  respondent: Types.ObjectId;
  response?: string;
  respondedAt?: Date;
}

export interface ReviewHelpful {
  count: number;
  users: Types.ObjectId[];
}

export interface IReview {
  readonly _id: Types.ObjectId;
  booking: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  aspect?: ReviewAspectRatings;
  isVerified: boolean;
  helpful: ReviewHelpful;
  images: ReviewImage[];
  responses: ReviewResponse[];
  createdAt: Date;
  updatedAt: Date;
}
