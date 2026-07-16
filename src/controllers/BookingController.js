import { sendSuccess, sendPaginatedSuccess, sendError } from '../utils/response.js';
import bookingService from '../services/BookingService.js';
import bookingRepository from '../repositories/BookingRepository.js';

export class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking({
        ...req.body,
        customerId: req.user._id,
      });
      sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const result = await bookingService.getCustomerBookings(req.user._id, req.query);
      sendPaginatedSuccess(res, result.data, result.pagination, 'Bookings retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getBarberBookings(req, res, next) {
    try {
      const result = await bookingService.getBarberBookings(req.user._id, req.query);
      sendPaginatedSuccess(res, result.data, result.pagination, 'Bookings retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingRepository.findById(req.params.id);
      sendSuccess(res, booking, 'Booking retrieved');
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user._id,
        req.body.reason
      );
      sendSuccess(res, booking, 'Booking cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  async rescheduleBooking(req, res, next) {
    try {
      const booking = await bookingService.rescheduleBooking(
        req.params.id,
        req.body.newDate,
        req.body.newStartTime,
        req.body.newEndTime,
        req.user._id
      );
      sendSuccess(res, booking, 'Booking rescheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const booking = await bookingService.confirmBooking(req.params.id);
      sendSuccess(res, booking, 'Booking confirmed');
    } catch (error) {
      next(error);
    }
  }

  async completeBooking(req, res, next) {
    try {
      const booking = await bookingService.completeBooking(req.params.id);
      sendSuccess(res, booking, 'Booking completed');
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
