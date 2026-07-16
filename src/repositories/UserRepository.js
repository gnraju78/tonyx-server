import { BaseRepository } from './BaseRepository.js';
import User from '../models/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  async findByPhone(phone) {
    return await this.model.findOne({ phone });
  }

  async findByRole(role, query = {}) {
    const { page, limit, skip } = query;
    const users = await this.model
      .find({ role, isActive: true })
      .select('-password')
      .skip(skip || 0)
      .limit(limit || 10);

    const total = await this.model.countDocuments({ role, isActive: true });

    return { data: users, total };
  }

  async findBarbers(query = {}) {
    return this.findByRole('barber', query);
  }

  async findWithPassword(id) {
    return await this.model.findById(id);
  }

  async updateLastLogin(userId) {
    return await this.model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async updateRating(userId, newRating, newCount) {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        'rating.average': newRating,
        'rating.count': newCount,
      },
      { new: true }
    );
  }

  async searchBarbers(query = {}) {
    const { specialization, minRating, maxPrice, page, limit } = query;
    let filter = { role: 'barber', isActive: true };

    if (specialization) {
      filter.specialization = { $in: [specialization] };
    }

    if (minRating) {
      filter['rating.average'] = { $gte: minRating };
    }

    const skip = ((page || 1) - 1) * (limit || 10);
    const users = await this.model
      .find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit || 10)
      .sort({ 'rating.average': -1 });

    const total = await this.model.countDocuments(filter);

    return { data: users, total };
  }
}

export default new UserRepository();
