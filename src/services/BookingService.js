import { AppError } from '../utils/AppError.js';
import bookingRepository from '../repositories/BookingRepository.js';
import userRepository from '../repositories/UserRepository.js';
import serviceRepository from '../repositories/ServiceRepository.js';
import TimeSlot from '../models/TimeSlot.js';

export class BookingService {
  async createBooking(bookingData) {
    const { customerId, barberId, serviceIds, scheduledDate, startTime, endTime, notes } = bookingData;

    // Validate users
    const customer = await userRepository.findById(customerId);
    const barber = await userRepository.findById(barberId);

    if (barber.role !== 'barber') {
      throw AppError.badRequest('Selected user is not a barber');
    }

    // Check for conflicting bookings
    const conflicts = await bookingRepository.findConflictingBookings(
      barberId,
      startTime,
      endTime,
      scheduledDate
    );

    if (conflicts.length > 0) {
      throw AppError.conflict('This time slot is already booked');
    }

    // Get services
    const services = await Promise.all(
      serviceIds.map(id => serviceRepository.findById(id))
    );

    // Calculate totals
    let totalPrice = 0;
    let totalDuration = 0;
    const serviceItems = services.map(service => {
      totalPrice += service.basePrice;
      totalDuration += service.duration;
      return {
        service: service._id,
        quantity: 1,
        price: service.basePrice,
      };
    });

    // Create booking
    const booking = await bookingRepository.create({
      customer: customerId,
      barber: barberId,
      services: serviceItems,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      totalDuration,
      totalPrice,
      notes,
      location: 'Main Studio',
      status: 'pending',
      'payment.status': 'pending',
    });

    // Increment service booking counts
    for (const service of services) {
      await serviceRepository.incrementBookingCount(service._id);
    }

    return booking.populate('barber', 'firstName lastName').populate('services.service');
  }

  async cancelBooking(bookingId, userId, reason) {
    const booking = await bookingRepository.findById(bookingId);

    if (booking.customer.toString() !== userId && booking.barber.toString() !== userId) {
      throw AppError.forbidden('You cannot cancel this booking');
    }

    if (booking.status === 'cancelled') {
      throw AppError.badRequest('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw AppError.badRequest('Cannot cancel completed booking');
    }

    return await bookingRepository.update(bookingId, {
      status: 'cancelled',
      cancellationReason: reason,
      cancellationTime: new Date(),
    });
  }

  async rescheduleBooking(bookingId, newDate, newStartTime, newEndTime, userId) {
    const booking = await bookingRepository.findById(bookingId);

    if (booking.customer.toString() !== userId) {
      throw AppError.forbidden('Only customer can reschedule');
    }

    // Check conflicts
    const conflicts = await bookingRepository.findConflictingBookings(
      booking.barber,
      newStartTime,
      newEndTime,
      newDate,
      bookingId
    );

    if (conflicts.length > 0) {
      throw AppError.conflict('New time slot is unavailable');
    }

    return await bookingRepository.update(bookingId, {
      scheduledDate: new Date(newDate),
      startTime: newStartTime,
      endTime: newEndTime,
      rescheduleCount: booking.rescheduleCount + 1,
    });
  }

  async completeBooking(bookingId) {
    return await bookingRepository.updateStatus(bookingId, 'completed');
  }

  async confirmBooking(bookingId) {
    return await bookingRepository.updateStatus(bookingId, 'confirmed');
  }

  async getCustomerBookings(customerId, query) {
    return await bookingRepository.findByCustomer(customerId, query);
  }

  async getBarberBookings(barberId, query) {
    return await bookingRepository.findByBarber(barberId, query);
  }
}

export default new BookingService();
