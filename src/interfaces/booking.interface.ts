import type { Types } from 'mongoose';
import type { AuditFields } from './base.interface.js';

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;
export type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
} as const;
export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const BookingPaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;
export type BookingPaymentStatusType =
  (typeof BookingPaymentStatus)[keyof typeof BookingPaymentStatus];

export interface BookingServiceItem {
  service: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface BookingPaymentInfo {
  method?: PaymentMethodType;
  status: BookingPaymentStatusType;
  transactionId?: string;
  paidAmount?: number;
}

export interface BookingRating {
  score?: number;
  review?: string;
  ratedAt?: Date;
}

export interface IBooking extends AuditFields {
  bookingNumber: string;
  customer: Types.ObjectId;
  barber: Types.ObjectId;
  services: BookingServiceItem[];
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  totalDuration: number;
  totalPrice: number;
  status: BookingStatusType;
  notes?: string;
  specialRequests?: string;
  payment: BookingPaymentInfo;
  location: string;
  reminderSent: boolean;
  rating?: BookingRating;
  cancellationReason?: string;
  cancellationTime?: Date;
  rescheduleCount: number;
}
