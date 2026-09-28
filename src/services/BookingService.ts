import { bookingRepository, type BookingListFilter } from '../repositories/BookingRepository.js';
import type { PaginatedResult } from '../repositories/BaseRepository.js';
import { BadRequestError, NotFoundError } from '../utils/AppError.js';
import { BookingStatus, type IBooking } from '../interfaces/booking.interface.js';
import type { CreateBookingDto } from '../validators/booking.validator.js';
import { whatsAppService } from './WhatsAppService.js';

export class BookingService {
  async createBooking(dto: CreateBookingDto): Promise<IBooking> {
    const booking = await bookingRepository.create({
      fullName: dto.fullName,
      partnerName: dto.partnerName,
      email: dto.email,
      mobileNumber: dto.mobileNumber,
      eventDate: dto.eventDate,
      location: dto.location,
      collectionOfInterest: dto.collectionOfInterest,
      tellUsAboutYourDay: dto.tellUsAboutYourDay,
      status: BookingStatus.PENDING,
    });

    // Send WhatsApp notification asynchronously on creation
    whatsAppService.sendBookingConfirmation(booking).catch(err => 
      console.error('Failed to send WhatsApp notification in background:', err)
    );

    return booking;
  }

  async cancelBooking(bookingId: string): Promise<IBooking> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError('Cannot cancel completed booking');
    }

    const updated = await bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });

    if (!updated) {
      throw new NotFoundError('Booking not found');
    }
    return updated;
  }

  async completeBooking(bookingId: string): Promise<IBooking> {
    const updated = await bookingRepository.updateStatus(bookingId, BookingStatus.COMPLETED);
    if (!updated) {
      throw new NotFoundError('Booking not found');
    }
    return updated;
  }

  async confirmBooking(bookingId: string): Promise<IBooking> {
    const updated = await bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    return updated;
  }

  async getBookingById(bookingId: string): Promise<IBooking> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    return booking;
  }

  async getAllBookings(query: BookingListFilter): Promise<PaginatedResult<IBooking>> {
    return bookingRepository.findAll(query);
  }
}

export const bookingService = new BookingService();
