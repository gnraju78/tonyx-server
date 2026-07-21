import { userRepository, type SearchBarbersFilter } from '../repositories/UserRepository.js';
import type { PaginatedResult } from '../repositories/BaseRepository.js';
import { NotFoundError, UnauthorizedError } from '../utils/AppError.js';
import { Role } from '../constants/roles.js';
import type { IUser } from '../interfaces/user.interface.js';
import type {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateAvailabilityDto,
} from '../validators/user.validator.js';

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<IUser> {
    const user = await userRepository.update(userId, dto);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await userRepository.findWithPassword(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await user.comparePassword(dto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    user.password = dto.newPassword;
    await user.save();
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<IUser> {
    const user = await userRepository.update(userId, {
      availability: new Map(Object.entries(dto.availability)),
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getBarbers(page?: number, limit?: number): Promise<PaginatedResult<IUser>> {
    return userRepository.findBarbers(page ?? 1, limit ?? 10);
  }

  async searchBarbers(filters: SearchBarbersFilter): Promise<PaginatedResult<IUser>> {
    return userRepository.searchBarbers(filters);
  }

  async getBarberById(barberId: string): Promise<IUser> {
    const barber = await userRepository.findById(barberId);
    if (!barber || barber.role !== Role.BARBER) {
      throw new NotFoundError('Barber not found');
    }
    return barber;
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await userRepository.update(userId, { isActive: false });
    if (!user) {
      throw new NotFoundError('User not found');
    }
  }
}

export const userService = new UserService();
