import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginatedSuccess, sendSuccess } from '../utils/response.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { bookingService } from '../services/BookingService.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { getValidatedQuery, type TypedRequest } from '../interfaces/http.interface.js';
import type {
  CreateBookingDto,
  CancelBookingDto,
  RescheduleBookingDto,
  BookingListQueryDto,
} from '../validators/booking.validator.js';

function requireUserId(req: { user?: { id: { toString(): string } } }): string {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  return req.user.id.toString();
}

export const createBooking = asyncHandler<TypedRequest<CreateBookingDto>>(async (req, res) => {
  const booking = await bookingService.createBooking(requireUserId(req), req.body);
  sendSuccess(res, booking, 'Booking created successfully', HttpStatus.CREATED);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<BookingListQueryDto>(req);
  const result = await bookingService.getCustomerBookings(requireUserId(req), query);
  sendPaginatedSuccess(res, result.data, result, 'Bookings retrieved');
});

export const getBarberBookings = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<BookingListQueryDto>(req);
  const result = await bookingService.getBarberBookings(requireUserId(req), query);
  sendPaginatedSuccess(res, result.data, result, 'Bookings retrieved');
});

export const getBookingById = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id);
    sendSuccess(res, booking, 'Booking retrieved');
  }
);

export const cancelBooking = asyncHandler<TypedRequest<CancelBookingDto, { id: string }>>(
  async (req, res) => {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      requireUserId(req),
      req.body.reason
    );
    sendSuccess(res, booking, 'Booking cancelled successfully');
  }
);

export const rescheduleBooking = asyncHandler<TypedRequest<RescheduleBookingDto, { id: string }>>(
  async (req, res) => {
    const booking = await bookingService.rescheduleBooking(
      req.params.id,
      requireUserId(req),
      req.body
    );
    sendSuccess(res, booking, 'Booking rescheduled successfully');
  }
);

export const confirmBooking = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    const booking = await bookingService.confirmBooking(req.params.id);
    sendSuccess(res, booking, 'Booking confirmed');
  }
);

export const completeBooking = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    const booking = await bookingService.completeBooking(req.params.id);
    sendSuccess(res, booking, 'Booking completed');
  }
);
