import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    aspect: {
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [mongoose.Schema.Types.ObjectId],
    },
    images: [{
      public_id: String,
      url: String,
    }],
    responses: [{
      respondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      response: String,
      respondedAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: 1 });

export default mongoose.model('Review', reviewSchema);
