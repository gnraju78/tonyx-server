import { Schema, model } from 'mongoose';
import type { IService } from '../interfaces/service.interface.js';
import { SeniorityLevel, ServiceCategory } from '../interfaces/service.interface.js';
import { auditFields } from './plugins/auditFields.js';

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: 10,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: Object.values(ServiceCategory),
      required: true,
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 5,
      max: 480,
    },
    image: {
      public_id: String,
      url: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    barberSpecialists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    requirements: {
      minSeniorityLevel: {
        type: String,
        enum: Object.values(SeniorityLevel),
        default: SeniorityLevel.BEGINNER,
      },
      tools: [String],
      products: [String],
    },
    popularity: {
      bookingCount: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5, default: 0 },
    },
    tags: [String],
    ...auditFields,
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ 'popularity.bookingCount': -1 });

export const Service = model<IService>('Service', serviceSchema);
