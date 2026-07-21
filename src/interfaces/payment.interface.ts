import type { Types } from 'mongoose';
import type { AuditFields } from './base.interface.js';

export const PaymentGatewayMethod = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  WALLET: 'wallet',
} as const;
export type PaymentGatewayMethodType =
  (typeof PaymentGatewayMethod)[keyof typeof PaymentGatewayMethod];

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface RefundDetails {
  refundId?: string;
  refundedAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
}

export interface IPayment extends AuditFields {
  transactionId: string;
  booking: Types.ObjectId;
  payer: Types.ObjectId;
  payee: Types.ObjectId;
  amount: number;
  method: PaymentGatewayMethodType;
  status: PaymentStatusType;
  currency: string;
  gateway?: string;
  gatewayTransactionId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  refundDetails?: RefundDetails;
}
