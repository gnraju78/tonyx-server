import { z } from 'zod';

/**
 * `role` is deliberately NOT accepted here. The original implementation let
 * callers pass `role: 'admin'` straight through to account creation — an
 * unauthenticated privilege-escalation hole. Public registration always
 * creates a `customer` account (see AuthService.register); elevated roles
 * are assigned out-of-band by an admin, not self-selected at signup.
 */
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().toLowerCase().email(),
    phone: z
      .string()
      .trim()
      .regex(
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        'Please provide a valid phone'
      ),
    password: z.string().min(6).max(128),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
