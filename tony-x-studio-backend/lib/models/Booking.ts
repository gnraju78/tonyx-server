import mongoose, { Schema, Document } from 'mongoose';

interface IPhotographySession extends Document {
  photographer: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration: number;
  basePrice: number;
  availability: {
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  maxBookings?: number;
  currentBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IBooking extends Document {
  client: mongoose.Types.ObjectId;
  photographer: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  attachments?: string[];
  payment?: {
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    amount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<IPhotographySession>(
  {
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    availability: [
      {
        date: Date,
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    maxBookings: { type: Number },
    currentBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const bookingSchema = new Schema<IBooking>(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'PhotographySession', required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String },
    location: { type: String },
    attachments: [{ type: String }],
    payment: {
      method: String,
      status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'] },
      transactionId: String,
      amount: Number,
    },
  },
  { timestamps: true }
);

export const PhotographySession = mongoose.models.PhotographySession || mongoose.model<IPhotographySession>('PhotographySession', sessionSchema);
export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
