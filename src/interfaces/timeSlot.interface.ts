import type { Types } from 'mongoose';

export const TimeSlotStatus = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
} as const;
export type TimeSlotStatusType = (typeof TimeSlotStatus)[keyof typeof TimeSlotStatus];

export interface ITimeSlot {
  readonly _id: Types.ObjectId;
  barber: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: Types.ObjectId;
  isBlocked: boolean;
  blockReason?: string;
  status: TimeSlotStatusType;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
