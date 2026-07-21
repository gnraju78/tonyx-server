import { bookingRepository, type BookingListFilter } from '../repositories/BookingRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { serviceRepository } from '../repositories/ServiceRepository.js';
import type { PaginatedResult } from '../repositories/BaseRepository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError.js';
import { Role } from '../constants/roles.js';
import {
  BookingPaymentStatus,
  BookingStatus,
  type IBooking,
} from '../interfaces/booking.interface.js';
import type { CreateBookingDto, RescheduleBookingDto } from '../validators/booking.validator.js';

export class BookingService {
  async createBooking(customerId: string, dto: CreateBookingDto): Promise<IBooking> {
    const barber = await userRepository.findById(dto.barberId);
    if (!barber) {
      throw new NotFoundError('Barber not found');
    }
    if (barber.role !== Role.BARBER) {
      throw new BadRequestError('Selected user is not a barber');
    }

    const conflicts = await bookingRepository.findConflictingBookings(
      dto.barberId,
      dto.startTime,
      dto.endTime,
      dto.scheduledDate
    );
    if (conflicts.length > 0) {
      throw new ConflictError('This time slot is already booked');
    }

    const services = await Promise.all(dto.serviceIds.map((id) => serviceRepository.findById(id)));
    const missingIndex = services.findIndex((service) => service === null);
    if (missingIndex !== -1) {
      throw new NotFoundError(`Service not found: ${dto.serviceIds[missingIndex]}`);
    }
    const resolvedServices = services.filter(
      (service): service is NonNullable<typeof service> => service !== null
    );

    let totalPrice = 0;
    let totalDuration = 0;
    const serviceItems = resolvedServices.map((service) => {
      totalPrice += service.basePrice;
      totalDuration += service.duration;
      return { service: service._id, quantity: 1, price: service.basePrice };
    });

    const booking = await bookingRepository.create({
      customer: customerId,
      barber: dto.barberId,
      services: serviceItems,
      scheduledDate: dto.scheduledDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalDuration,
      totalPrice,
      notes: dto.notes,
      specialRequests: dto.specialRequests,
      location: 'Main Studio',
      status: BookingStatus.PENDING,
      payment: { status: BookingPaymentStatus.PENDING },
    });

    await Promise.all(
      resolvedServices.map((service) =>
        serviceRepository.incrementBookingCount(service._id.toString())
      )
    );

    const populated = await bookingRepository.findByIdPopulated(booking._id.toString());
    if (!populated) {
      throw new NotFoundError('Booking not found after creation');
    }
    return populated;
  }

  async cancelBooking(bookingId: string, userId: string, reason: string): Promise<IBooking> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const isParticipant =
      booking.customer.toString() === userId || booking.barber.toString() === userId;
    if (!isParticipant) {
      throw new ForbiddenError('You cannot cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError('Cannot cancel completed booking');
    }

    const updated = await bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
      cancellationTime: new Date(),
    });

    if (!updated) {
      throw new NotFoundError('Booking not found');
    }
    return updated;
  }

  async rescheduleBooking(
    bookingId: string,
    userId: string,
    dto: RescheduleBookingDto
  ): Promise<IBooking> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customer.toString() !== userId) {
      throw new ForbiddenError('Only the customer can reschedule this booking');
    }

    const conflicts = await bookingRepository.findConflictingBookings(
      booking.barber.toString(),
      dto.newStartTime,
      dto.newEndTime,
      dto.newDate,
      bookingId
    );
    if (conflicts.length > 0) {
      throw new ConflictError('New time slot is unavailable');
    }

    const updated = await bookingRepository.update(bookingId, {
      scheduledDate: dto.newDate,
      startTime: dto.newStartTime,
      endTime: dto.newEndTime,
      rescheduleCount: booking.rescheduleCount + 1,
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

  async getCustomerBookings(
    customerId: string,
    query: BookingListFilter
  ): Promise<PaginatedResult<IBooking>> {
    return bookingRepository.findByCustomer(customerId, query);
  }

  async getBarberBookings(
    barberId: string,
    query: BookingListFilter & { date?: string }
  ): Promise<PaginatedResult<IBooking>> {
    return bookingRepository.findByBarber(barberId, query);
  }
}

export const bookingService = new BookingService();
