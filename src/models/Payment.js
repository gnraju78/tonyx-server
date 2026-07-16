import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'online', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    gateway: String,
    gatewayTransactionId: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    failureReason: String,
    refundDetails: {
      refundId: String,
      refundedAmount: Number,
      refundReason: String,
      refundedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
