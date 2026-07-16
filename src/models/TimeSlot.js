import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    barber: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: String,
    status: {
      type: String,
      enum: ['available', 'booked', 'blocked', 'completed'],
      default: 'available',
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

// Indexes for efficient querying
timeSlotSchema.index({ barber: 1, date: 1, startTime: 1 });
timeSlotSchema.index({ date: 1, isBooked: 1 });
timeSlotSchema.index({ status: 1 });

export default mongoose.model('TimeSlot', timeSlotSchema);
