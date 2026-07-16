import userRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

export class UserService {
  async getProfile(userId) {
    return await userRepository.findById(userId);
  }

  async updateProfile(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'bio', 'specialization', 'profileImage'];
    const updates = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    return await userRepository.update(userId, updates);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findWithPassword(userId);

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    return await user.save();
  }

  async updateAvailability(userId, availability) {
    return await userRepository.update(userId, { availability });
  }

  async getBarbers(query) {
    return await userRepository.findBarbers(query);
  }

  async searchBarbers(filters) {
    return await userRepository.searchBarbers(filters);
  }

  async getBarberById(barberId) {
    const barber = await userRepository.findById(barberId);

    if (barber.role !== 'barber') {
      throw AppError.notFound('Barber not found');
    }

    return barber;
  }

  async updateRating(userId, newRating, newCount) {
    return await userRepository.updateRating(userId, newRating, newCount);
  }

  async deactivateAccount(userId) {
    return await userRepository.update(userId, { isActive: false });
  }

  async activateAccount(userId) {
    return await userRepository.update(userId, { isActive: true });
  }
}

export default new UserService();
