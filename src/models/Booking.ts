import { randomBytes } from 'node:crypto';
import { Schema, model } from 'mongoose';
import type { IBooking } from '../interfaces/booking.interface.js';
import {
  BookingPaymentStatus,
  BookingStatus,
  PaymentMethod,
} from '../interfaces/booking.interface.js';
import { auditFields } from './plugins/auditFields.js';

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      // sparse: false is fine — bookingNumber is always set in the pre-save
      // hook below, so the unique index never sees more than one `undefined`.
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    barber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
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
      },
    ],
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
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
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
        enum: Object.values(PaymentMethod),
      },
      status: {
        type: String,
        enum: Object.values(BookingPaymentStatus),
        default: BookingPaymentStatus.PENDING,
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
      score: { type: Number, min: 0, max: 5 },
      review: { type: String, maxlength: 500 },
      ratedAt: Date,
    },
    cancellationReason: String,
    cancellationTime: Date,
    rescheduleCount: {
      type: Number,
      default: 0,
    },
    ...auditFields,
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre('save', function generateBookingNumber(next) {
  if (!this.isNew || this.bookingNumber) {
    next();
    return;
  }

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = randomBytes(4).toString('hex').toUpperCase();
  this.bookingNumber = `BK-${datePart}-${randomPart}`;
  next();
});

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ barber: 1, createdAt: -1 });
bookingSchema.index({ scheduledDate: 1, barber: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'payment.status': 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
