import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import {
  createBookingSchema,
  cancelBookingSchema,
} from '../validators/booking.validator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator.js';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const envelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
    meta: z.object({ timestamp: z.string() }),
  });

const authResponseSchema = envelope(
  z.object({
    user: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      role: z.string(),
    }),
    token: z.string(),
  })
);

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: registerSchema } } } },
  responses: {
    201: {
      description: 'User registered',
      content: { 'application/json': { schema: authResponseSchema } },
    },
    409: { description: 'Email or phone already registered' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['Auth'],
  summary: 'Log in with email and password',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: authResponseSchema } },
    },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/profile',
  tags: ['Auth'],
  summary: "Get the authenticated user's profile",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'Current user profile' },
    401: { description: 'Not authenticated' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/users/profile',
  tags: ['Users'],
  summary: "Update the authenticated user's profile",
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: updateProfileSchema } } } },
  responses: { 200: { description: 'Profile updated' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/users/change-password',
  tags: ['Users'],
  summary: 'Change the authenticated user’s password',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: changePasswordSchema } } } },
  responses: {
    200: { description: 'Password changed' },
    401: { description: 'Current password incorrect' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/barbers',
  tags: ['Users'],
  summary: 'List barbers',
  responses: { 200: { description: 'Paginated list of barbers' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/services',
  tags: ['Services'],
  summary: 'List services',
  responses: { 200: { description: 'Paginated list of services' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/services/{id}',
  tags: ['Services'],
  summary: 'Get a service by id',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Service' }, 404: { description: 'Service not found' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/services',
  tags: ['Services'],
  summary: 'Create a service (admin/manager only)',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: createServiceSchema } } } },
  responses: { 201: { description: 'Service created' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/services/{id}',
  tags: ['Services'],
  summary: 'Update a service (admin/manager only)',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: updateServiceSchema } } },
  },
  responses: { 200: { description: 'Service updated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/bookings',
  tags: ['Bookings'],
  summary: 'Create a booking',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: createBookingSchema } } } },
  responses: {
    201: { description: 'Booking created' },
    409: { description: 'Time slot already booked' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/bookings/my-bookings',
  tags: ['Bookings'],
  summary: "List the authenticated customer's bookings",
  security: [{ [bearerAuth.name]: [] }],
  responses: { 200: { description: 'Paginated list of bookings' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/bookings/{id}/cancel',
  tags: ['Bookings'],
  summary: 'Cancel a booking',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: cancelBookingSchema } } },
  },
  responses: { 200: { description: 'Booking cancelled' } },
});


