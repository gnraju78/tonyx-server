import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    services: [{
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    }],
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    specialRequests: {
      type: String,
      maxlength: 500,
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'online'],
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAmount: Number,
    },
    location: {
      type: String,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    rating: {
      score: {
        type: Number,
        min: 0,
        max: 5,
      },
      review: {
        type: String,
        maxlength: 500,
      },
      ratedAt: Date,
    },
    cancellationReason: String,
    cancellationTime: Date,
    rescheduleCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ barber: 1, createdAt: -1 });
bookingSchema.index({ scheduledDate: 1, barber: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'payment.status': 1 });

export default mongoose.model('Booking', bookingSchema);
