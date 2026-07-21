import { BaseRepository, type PaginatedResult } from './BaseRepository.js';
import { User, type UserDocument } from '../models/User.js';
import type { IUser } from '../interfaces/user.interface.js';
import { Role } from '../constants/roles.js';

export interface SearchBarbersFilter {
  readonly specialization?: string;
  readonly minRating?: number;
  readonly page?: number;
  readonly limit?: number;
}

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null });
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return User.findOne({ phone, deletedAt: null });
  }

  // Mongoose's `.select()` overloads rebuild the Query's result type without
  // re-threading the model's custom instance-methods generic (a known
  // mongoose+TS typing gap), so the chained call loses `comparePassword`/
  // `getFullName` in its inferred type even though they're present at
  // runtime. The cast restores the type that's actually correct here.
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select(
      '+password'
    );
    return user as UserDocument | null;
  }

  async findWithPassword(id: string): Promise<UserDocument | null> {
    const user = await User.findOne({ _id: id, deletedAt: null }).select('+password');
    return user as UserDocument | null;
  }

  async findBarbers(page: number, limit: number): Promise<PaginatedResult<IUser>> {
    return this.findAll({ filter: { role: Role.BARBER, isActive: true }, page, limit });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.updateOne({ _id: userId }, { lastLogin: new Date() });
  }

  async updateRating(
    userId: string,
    newAverage: number,
    newCount: number
  ): Promise<UserDocument | null> {
    return User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { 'rating.average': newAverage, 'rating.count': newCount },
      { new: true }
    );
  }

  async searchBarbers(searchFilter: SearchBarbersFilter): Promise<PaginatedResult<IUser>> {
    const filter: Record<string, unknown> = { role: Role.BARBER, isActive: true };

    if (searchFilter.specialization) {
      filter.specialization = { $in: [searchFilter.specialization] };
    }

    if (searchFilter.minRating !== undefined) {
      filter['rating.average'] = { $gte: searchFilter.minRating };
    }

    return this.findAll({
      filter,
      page: searchFilter.page,
      limit: searchFilter.limit,
      sort: { 'rating.average': -1 },
    });
  }
}

export const userRepository = new UserRepository();
