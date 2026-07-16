import { BaseRepository } from './BaseRepository.js';
import Booking from '../models/Booking.js';

export class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findByCustomer(customerId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    let filter = { customer: customerId };
    if (status) filter.status = status;

    const bookings = await this.model
      .find(filter)
      .populate('barber', 'firstName lastName profileImage rating')
      .populate('services.service', 'name category basePrice duration')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledDate: -1 });

    const total = await this.model.countDocuments(filter);

    return { data: bookings, total, page, limit };
  }

  async findByBarber(barberId, query = {}) {
    const { page = 1, limit = 10, status, date } = query;
    const skip = (page - 1) * limit;

    let filter = { barber: barberId };
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const bookings = await this.model
      .find(filter)
      .populate('customer', 'firstName lastName phone profileImage')
      .populate('services.service', 'name duration')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledDate: 1 });

    const total = await this.model.countDocuments(filter);

    return { data: bookings, total, page, limit };
  }

  async findByDate(barberId, date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    return await this.model.find({
      barber: barberId,
      scheduledDate: { $gte: startDate, $lt: endDate },
      status: { $ne: 'cancelled' },
    });
  }

  async findConflictingBookings(barberId, startTime, endTime, date, excludeId = null) {
    let filter = {
      barber: barberId,
      status: { $ne: 'cancelled' },
      scheduledDate: date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return await this.model.find(filter);
  }

  async updateStatus(bookingId, status) {
    return await this.model.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
  }

  async updatePaymentStatus(bookingId, paymentStatus) {
    return await this.model.findByIdAndUpdate(
      bookingId,
      { 'payment.status': paymentStatus },
      { new: true }
    );
  }

  async addRating(bookingId, rating) {
    return await this.model.findByIdAndUpdate(
      bookingId,
      { rating, status: 'completed' },
      { new: true }
    );
  }

  async getBookingStats(barberId, startDate, endDate) {
    return await this.model.aggregate([
      {
        $match: {
          barber: barberId,
          scheduledDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
        },
      },
    ]);
  }
}

export default new BookingRepository();
