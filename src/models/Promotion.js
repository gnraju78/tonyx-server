import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true,
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
      enum: ['percentage', 'fixed'],
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
      currentUsage: {
        type: Number,
        default: 0,
      },
    },
    applicableServices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    applicableUsers: {
      type: {
        type: String,
        enum: ['all', 'specific', 'new_customers', 'loyal_customers'],
        default: 'all',
      },
      users: [mongoose.Schema.Types.ObjectId],
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
    usedBy: [{
      user: mongoose.Schema.Types.ObjectId,
      booking: mongoose.Schema.Types.ObjectId,
      usedAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export default mongoose.model('Promotion', promotionSchema);
