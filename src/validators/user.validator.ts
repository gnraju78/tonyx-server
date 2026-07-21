import { z } from 'zod';

const profileImageSchema = z.object({
  public_id: z.string(),
  url: z.string().url(),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    specialization: z.array(z.string()).optional(),
    profileImage: profileImageSchema.optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(128),
  })
  .strict();

const availabilitySlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const updateAvailabilitySchema = z
  .object({
    availability: z.record(z.string(), z.array(availabilitySlotSchema)),
  })
  .strict();

export const searchBarbersQuerySchema = z.object({
  specialization: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type UpdateAvailabilityDto = z.infer<typeof updateAvailabilitySchema>;
export type SearchBarbersQueryDto = z.infer<typeof searchBarbersQuerySchema>;
