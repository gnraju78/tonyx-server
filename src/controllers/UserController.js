import { sendSuccess, sendPaginatedSuccess } from '../utils/response.js';
import userRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

export class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user._id);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const allowedFields = ['firstName', 'lastName', 'bio', 'specialization', 'profileImage'];
      const updates = {};

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await userRepository.update(req.user._id, updates);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBarbers(req, res, next) {
    try {
      const result = await userRepository.findBarbers({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      });
      sendPaginatedSuccess(
        res,
        result.data,
        { total: result.total, page: 1, limit: 10 },
        'Barbers retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async searchBarbers(req, res, next) {
    try {
      const result = await userRepository.searchBarbers({
        specialization: req.query.specialization,
        minRating: req.query.minRating,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      });
      sendPaginatedSuccess(
        res,
        result.data,
        { total: result.total, page: 1, limit: 10 },
        'Barbers found'
      );
    } catch (error) {
      next(error);
    }
  }

  async getBarberById(req, res, next) {
    try {
      const barber = await userRepository.findById(req.params.id);

      if (barber.role !== 'barber') {
        throw AppError.notFound('Barber not found');
      }

      sendSuccess(res, barber, 'Barber retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await userRepository.findWithPassword(req.user._id);

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw AppError.unauthorized('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const user = await userRepository.update(req.user._id, {
        availability: req.body.availability,
      });
      sendSuccess(res, user, 'Availability updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req, res, next) {
    try {
      await userRepository.update(req.user._id, { isActive: false });
      sendSuccess(res, null, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
