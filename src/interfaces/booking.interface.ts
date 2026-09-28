import type { AuditFields } from './base.interface.js';

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface IBooking extends AuditFields {
  bookingNumber: string;
  fullName: string;
  partnerName?: string;
  email: string;
  mobileNumber: string;
  eventDate?: string;
  location: string;
  collectionOfInterest: string;
  tellUsAboutYourDay?: string;
  status: BookingStatusType;
}
