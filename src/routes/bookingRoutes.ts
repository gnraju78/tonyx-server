import { Router } from 'express';
import * as bookingController from '../controllers/BookingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  bookingListQuerySchema,
} from '../validators/booking.validator.js';

const router = Router();

// Customer bookings
router.post(
  '/',
  authenticate,
  validate({ body: createBookingSchema }),
  bookingController.createBooking
);
router.get(
  '/my-bookings',
  authenticate,
  validate({ query: bookingListQuerySchema }),
  bookingController.getMyBookings
);

// Barber bookings
router.get(
  '/barber/my-bookings',
  authenticate,
  authorize(Role.BARBER),
  validate({ query: bookingListQuerySchema }),
  bookingController.getBarberBookings
);

router.get(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  bookingController.getBookingById
);
router.put(
  '/:id/cancel',
  authenticate,
  validate({ params: idParamSchema, body: cancelBookingSchema }),
  bookingController.cancelBooking
);
router.put(
  '/:id/reschedule',
  authenticate,
  validate({ params: idParamSchema, body: rescheduleBookingSchema }),
  bookingController.rescheduleBooking
);
router.put(
  '/:id/confirm',
  authenticate,
  authorize(Role.BARBER, Role.ADMIN),
  validate({ params: idParamSchema }),
  bookingController.confirmBooking
);
router.put(
  '/:id/complete',
  authenticate,
  authorize(Role.BARBER, Role.ADMIN),
  validate({ params: idParamSchema }),
  bookingController.completeBooking
);

export default router;
