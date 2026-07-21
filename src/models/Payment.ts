import { Schema, model } from 'mongoose';
import type { IPayment } from '../interfaces/payment.interface.js';
import { PaymentGatewayMethod, PaymentStatus } from '../interfaces/payment.interface.js';
import { auditFields } from './plugins/auditFields.js';

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    payer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payee: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(PaymentGatewayMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    gateway: String,
    gatewayTransactionId: String,
    description: String,
    metadata: Schema.Types.Mixed,
    failureReason: String,
    refundDetails: {
      refundId: String,
      refundedAmount: Number,
      refundReason: String,
      refundedAt: Date,
    },
    ...auditFields,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = model<IPayment>('Payment', paymentSchema);
