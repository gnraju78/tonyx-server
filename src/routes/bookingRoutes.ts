import { Router } from 'express';
import * as bookingController from '../controllers/BookingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingListQuerySchema,
} from '../validators/booking.validator.js';

const router = Router();

// Create booking (Public or authenticated, depending on usecase)
// But keeping it consistent:
router.post(
  '/',
  validate({ body: createBookingSchema }),
  bookingController.createBooking
);

router.get(
  '/',
  authenticate,
  validate({ query: bookingListQuerySchema }),
  bookingController.getAllBookings
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
  '/:id/confirm',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema }),
  bookingController.confirmBooking
);

router.put(
  '/:id/complete',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema }),
  bookingController.completeBooking
);

export default router;
