import mongoose, { Schema, Document } from 'mongoose';

interface IService extends Document {
  photographer: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  pricePerHour?: number;
  packages?: {
    name: string;
    price: number;
    duration: number;
    deliverables: string[];
  }[];
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  photographer: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  status: 'approved' | 'pending' | 'rejected';
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IRating extends Document {
  photographer: mongoose.Types.ObjectId;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    pricePerHour: { type: Number },
    packages: [
      {
        name: String,
        price: Number,
        duration: Number,
        deliverables: [String],
      },
    ],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const reviewSchema = new Schema<IReview>(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ratingSchema = new Schema<IRating>(
  {
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema);
export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
export const Rating = mongoose.models.Rating || mongoose.model<IRating>('Rating', ratingSchema);
