import { z } from 'zod';

export const createBookingSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    partnerName: z.string().trim().optional(),
    email: z.string().email('Invalid email address').trim(),
    mobileNumber: z.string().trim().min(1, 'Mobile number is required'),
    eventDate: z.string().trim().optional(),
    location: z.string().trim().min(1, 'Location is required'),
    collectionOfInterest: z.string().trim().min(1, 'Collection of interest is required'),
    tellUsAboutYourDay: z.string().max(1000).optional(),
  })
  .strict();

export const cancelBookingSchema = z
  .object({
    reason: z.string().trim().min(1).max(500),
  })
  .strict();

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled'])
    .optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
export type BookingListQueryDto = z.infer<typeof bookingListQuerySchema>;
