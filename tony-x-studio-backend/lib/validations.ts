import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'photographer']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// User Schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional().nullable(),
    facebook: z.string().url().optional().nullable(),
    twitter: z.string().url().optional().nullable(),
    website: z.string().url().optional().nullable(),
  }).optional(),
});

// Photo/Gallery Schemas
export const createPhotoSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  albumId: z.string().optional(),
});

export const createAlbumSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// Booking Schemas
export const createSessionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  duration: z.number().min(15),
  basePrice: z.number().min(0),
  maxBookings: z.number().optional(),
});

export const createBookingSchema = z.object({
  sessionId: z.string(),
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

// Blog Schemas
export const createBlogCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  categoryId: z.string(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentCommentId: z.string().optional(),
});

// Service Schemas
export const createServiceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(1),
  basePrice: z.number().min(0),
  pricePerHour: z.number().optional(),
});

// Review Schemas
export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10).max(5000),
  bookingId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
