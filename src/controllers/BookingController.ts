import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginatedSuccess, sendSuccess } from '../utils/response.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { bookingService } from '../services/BookingService.js';
import { getValidatedQuery, type TypedRequest } from '../interfaces/http.interface.js';
import type {
  CreateBookingDto,
  CancelBookingDto,
  BookingListQueryDto,
} from '../validators/booking.validator.js';

export const createBooking = asyncHandler<TypedRequest<CreateBookingDto>>(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  sendSuccess(res, booking, 'Booking created successfully', HttpStatus.CREATED);
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<BookingListQueryDto>(req);
  const result = await bookingService.getAllBookings(query);
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
      req.params.id
    );
    sendSuccess(res, booking, 'Booking cancelled successfully');
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
