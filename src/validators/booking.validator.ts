import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');

export const createBookingSchema = z
  .object({
    barberId: objectIdSchema,
    serviceIds: z.array(objectIdSchema).min(1, 'At least one service is required'),
    scheduledDate: z.coerce.date(),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    notes: z.string().max(500).optional(),
    specialRequests: z.string().max(500).optional(),
  })
  .strict();

export const cancelBookingSchema = z
  .object({
    reason: z.string().trim().min(1).max(500),
  })
  .strict();

export const rescheduleBookingSchema = z
  .object({
    newDate: z.coerce.date(),
    newStartTime: timeStringSchema,
    newEndTime: timeStringSchema,
  })
  .strict();

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z
    .enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .optional(),
  date: z.string().optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingDto = z.infer<typeof rescheduleBookingSchema>;
export type BookingListQueryDto = z.infer<typeof bookingListQuerySchema>;
