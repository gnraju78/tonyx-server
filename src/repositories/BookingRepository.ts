import type { FilterQuery } from 'mongoose';
import { BaseRepository, type PaginatedResult } from './BaseRepository.js';
import { Booking } from '../models/Booking.js';
import type { IBooking } from '../interfaces/booking.interface.js';

export interface BookingListFilter {
  readonly page?: number;
  readonly limit?: number;
  readonly status?: string;
}

interface AggregatedStatusCount {
  readonly _id: string;
  readonly count: number;
  readonly totalAmount: number;
}

export class BookingRepository extends BaseRepository<IBooking> {
  constructor() {
    super(Booking);
  }

  async findByIdPopulated(id: string): Promise<IBooking | null> {
    return Booking.findOne({ _id: id, deletedAt: null })
      .populate('barber', 'firstName lastName')
      .populate('services.service');
  }

  async findByCustomer(
    customerId: string,
    query: BookingListFilter
  ): Promise<PaginatedResult<IBooking>> {
    const filter: FilterQuery<IBooking> = { customer: customerId };
    if (query.status) filter.status = query.status;

    return this.findWithPopulate(filter, query, { scheduledDate: -1 });
  }

  async findByBarber(
    barberId: string,
    query: BookingListFilter & { date?: string }
  ): Promise<PaginatedResult<IBooking>> {
    const filter: FilterQuery<IBooking> = { barber: barberId };
    if (query.status) filter.status = query.status;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    return this.findWithPopulate(filter, query, { scheduledDate: 1 });
  }

  async findConflictingBookings(
    barberId: string,
    startTime: string,
    endTime: string,
    date: Date,
    excludeId?: string
  ): Promise<IBooking[]> {
    const filter: FilterQuery<IBooking> = {
      barber: barberId,
      status: { $ne: 'cancelled' },
      scheduledDate: date,
      deletedAt: null,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return Booking.find(filter);
  }

  async updateStatus(bookingId: string, status: IBooking['status']): Promise<IBooking | null> {
    return this.update(bookingId, { status });
  }

  async getBookingStats(
    barberId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AggregatedStatusCount[]> {
    return Booking.aggregate<AggregatedStatusCount>([
      {
        $match: {
          barber: barberId,
          scheduledDate: { $gte: startDate, $lte: endDate },
          deletedAt: null,
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

  private async findWithPopulate(
    filter: FilterQuery<IBooking>,
    query: { page?: number; limit?: number },
    sort: Record<string, 1 | -1>
  ): Promise<PaginatedResult<IBooking>> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const fullFilter = { ...filter, deletedAt: null };

    const [data, total] = await Promise.all([
      Booking.find(fullFilter)
        .populate('customer', 'firstName lastName phone profileImage')
        .populate('barber', 'firstName lastName profileImage rating')
        .populate('services.service', 'name category basePrice duration')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(fullFilter),
    ]);

    return { data, total, page, limit };
  }
}

export const bookingRepository = new BookingRepository();
