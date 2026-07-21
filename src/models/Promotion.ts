import { Schema, model } from 'mongoose';
import type { IPromotion } from '../interfaces/promotion.interface.js';
import { DiscountType, PromotionAudience } from '../interfaces/promotion.interface.js';

const promotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: Number,
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      perUser: Number,
      total: Number,
      currentUsage: { type: Number, default: 0 },
    },
    applicableServices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    applicableUsers: {
      type: {
        type: String,
        enum: Object.values(PromotionAudience),
        default: PromotionAudience.ALL,
      },
      users: [Schema.Types.ObjectId],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usedBy: [
      {
        user: Schema.Types.ObjectId,
        booking: Schema.Types.ObjectId,
        usedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const Promotion = model<IPromotion>('Promotion', promotionSchema);
