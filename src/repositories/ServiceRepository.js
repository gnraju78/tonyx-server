import { BaseRepository } from './BaseRepository.js';
import Service from '../models/Service.js';

export class ServiceRepository extends BaseRepository {
  constructor() {
    super(Service);
  }

  async findByCategory(category, query = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const services = await this.model
      .find({ category, isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.model.countDocuments({ category, isActive: true });

    return { data: services, total, page, limit };
  }

  async findPopular(limit = 10) {
    return await this.model
      .find({ isActive: true })
      .sort({ 'popularity.bookingCount': -1 })
      .limit(limit);
  }

  async findByBarber(barberId) {
    return await this.model.find({
      barberSpecialists: barberId,
      isActive: true,
    });
  }

  async incrementBookingCount(serviceId) {
    return await this.model.findByIdAndUpdate(
      serviceId,
      { $inc: { 'popularity.bookingCount': 1 } },
      { new: true }
    );
  }

  async updateAverageRating(serviceId, rating) {
    return await this.model.findByIdAndUpdate(
      serviceId,
      { 'popularity.averageRating': rating },
      { new: true }
    );
  }

  async search(searchTerm, query = {}) {
    const { page = 1, limit = 10, category } = query;
    const skip = (page - 1) * limit;

    let filter = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    };

    if (category) {
      filter.category = category;
    }

    const services = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ 'popularity.bookingCount': -1 });

    const total = await this.model.countDocuments(filter);

    return { data: services, total, page, limit };
  }
}

export default new ServiceRepository();
