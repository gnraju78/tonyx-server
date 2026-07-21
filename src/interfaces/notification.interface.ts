import type { Types } from 'mongoose';

export const NotificationType = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  NEW_REVIEW: 'new_review',
  REVIEW_RESPONSE: 'review_response',
  PROMOTION: 'promotion',
  SYSTEM_ALERT: 'system_alert',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  RESCHEDULE_REQUEST: 'reschedule_request',
} as const;
export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type NotificationPriorityType =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

export const NotificationReferenceModel = {
  BOOKING: 'Booking',
  PAYMENT: 'Payment',
  REVIEW: 'Review',
  USER: 'User',
  SERVICE: 'Service',
} as const;
export type NotificationReferenceModelType =
  (typeof NotificationReferenceModel)[keyof typeof NotificationReferenceModel];

export interface NotificationReference {
  model?: NotificationReferenceModelType;
  id?: Types.ObjectId;
}

export interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  sms: boolean;
}

export interface INotification {
  readonly _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationTypeType;
  title: string;
  message: string;
  reference?: NotificationReference;
  isRead: boolean;
  readAt?: Date;
  channels: NotificationChannels;
  priority: NotificationPriorityType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
