import type { FilterQuery } from 'mongoose';
import { BaseRepository, type PaginatedResult } from './BaseRepository.js';
import { Booking } from '../models/Booking.js';
import type { IBooking } from '../interfaces/booking.interface.js';

export interface BookingListFilter {
  readonly page?: number;
  readonly limit?: number;
  readonly status?: string;
}

export class BookingRepository extends BaseRepository<IBooking> {
  constructor() {
    super(Booking);
  }

  async findAll(
    query: BookingListFilter
  ): Promise<PaginatedResult<IBooking>> {
    const filter: FilterQuery<IBooking> = {};
    if (query.status) filter.status = query.status;

    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const fullFilter = { ...filter, deletedAt: null };

    const [data, total] = await Promise.all([
      Booking.find(fullFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(fullFilter),
    ]);

    return { data, total, page, limit };
  }

  async updateStatus(bookingId: string, status: IBooking['status']): Promise<IBooking | null> {
    return this.update(bookingId, { status });
  }
}

export const bookingRepository = new BookingRepository();
