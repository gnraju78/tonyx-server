import type { FilterQuery } from 'mongoose';
import { BaseRepository, type PaginatedResult } from './BaseRepository.js';
import { Service } from '../models/Service.js';
import type { IService } from '../interfaces/service.interface.js';

export class ServiceRepository extends BaseRepository<IService> {
  constructor() {
    super(Service);
  }

  async findByCategory(
    category: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<IService>> {
    return this.findAll({
      filter: { category, isActive: true },
      page,
      limit,
      sort: { createdAt: -1 },
    });
  }

  async findPopular(limit: number): Promise<IService[]> {
    return Service.find({ isActive: true, deletedAt: null })
      .sort({ 'popularity.bookingCount': -1 })
      .limit(limit);
  }

  async incrementBookingCount(serviceId: string): Promise<IService | null> {
    return Service.findOneAndUpdate(
      { _id: serviceId, deletedAt: null },
      { $inc: { 'popularity.bookingCount': 1 } },
      { new: true }
    );
  }

  async updateAverageRating(serviceId: string, rating: number): Promise<IService | null> {
    return this.update(serviceId, { 'popularity.averageRating': rating });
  }

  async search(
    searchTerm: string,
    category?: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<IService>> {
    const safeTerm = escapeRegex(searchTerm);
    const filter: FilterQuery<IService> = {
      isActive: true,
      $or: [
        { name: { $regex: safeTerm, $options: 'i' } },
        { description: { $regex: safeTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(safeTerm, 'i')] } },
      ],
    };

    if (category) {
      filter.category = category;
    }

    return this.findAll({ filter, page, limit, sort: { 'popularity.bookingCount': -1 } });
  }
}

/** Prevents user-supplied search terms from being interpreted as regex syntax. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const serviceRepository = new ServiceRepository();
