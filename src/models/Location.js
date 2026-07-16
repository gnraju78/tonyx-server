import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      zipCode: String,
      country: {
        type: String,
        required: true,
      },
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    phone: String,
    email: String,
    workingHours: {
      monday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      tuesday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      wednesday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      thursday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      friday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      saturday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
      sunday: {
        open: String,
        close: String,
        isOpen: Boolean,
      },
    },
    image: {
      public_id: String,
      url: String,
    },
    capacity: Number,
    amenities: [String],
    staff: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
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

// Index
locationSchema.index({ isActive: 1 });

export default mongoose.model('Location', locationSchema);
