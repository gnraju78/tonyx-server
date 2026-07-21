import { Schema, model } from 'mongoose';
import type { ILocation } from '../interfaces/location.interface.js';

const dayHoursSchema = {
  open: String,
  close: String,
  isOpen: Boolean,
};

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zipCode: String,
      country: { type: String, required: true },
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    phone: String,
    email: String,
    workingHours: {
      monday: dayHoursSchema,
      tuesday: dayHoursSchema,
      wednesday: dayHoursSchema,
      thursday: dayHoursSchema,
      friday: dayHoursSchema,
      saturday: dayHoursSchema,
      sunday: dayHoursSchema,
    },
    image: {
      public_id: String,
      url: String,
    },
    capacity: Number,
    amenities: [String],
    staff: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

export const Location = model<ILocation>('Location', locationSchema);
