
import { Schema, model } from 'mongoose';
import type { IBooking } from '../interfaces/booking.interface.js';
import { BookingStatus } from '../interfaces/booking.interface.js';
import { auditFields } from './plugins/auditFields.js';

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    partnerName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    eventDate: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
    },
    collectionOfInterest: {
      type: String,
      required: true,
    },
    tellUsAboutYourDay: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    ...auditFields,
  },
  {
    timestamps: true,
  }
);



bookingSchema.index({ email: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
