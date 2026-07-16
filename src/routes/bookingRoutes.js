import express from 'express';
import bookingController from '../controllers/BookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer bookings
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/:id/reschedule', authenticate, bookingController.rescheduleBooking);

// Barber bookings
router.get('/barber/my-bookings', authenticate, authorize('barber'), bookingController.getBarberBookings);
router.put('/:id/confirm', authenticate, authorize('barber', 'admin'), bookingController.confirmBooking);
router.put('/:id/complete', authenticate, authorize('barber', 'admin'), bookingController.completeBooking);

export default router;
