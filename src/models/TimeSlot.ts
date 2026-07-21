import { Schema, model } from 'mongoose';
import type { ITimeSlot } from '../interfaces/timeSlot.interface.js';
import { TimeSlotStatus } from '../interfaces/timeSlot.interface.js';

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    barber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
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
    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: String,
    status: {
      type: String,
      enum: Object.values(TimeSlotStatus),
      default: TimeSlotStatus.AVAILABLE,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
  },
  {
    timestamps: true,
  }
);

timeSlotSchema.index({ barber: 1, date: 1, startTime: 1 });
timeSlotSchema.index({ date: 1, isBooked: 1 });
timeSlotSchema.index({ status: 1 });

export const TimeSlot = model<ITimeSlot>('TimeSlot', timeSlotSchema);
