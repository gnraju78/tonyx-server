import jwt from 'jwt-simple';
import { AppError } from '../utils/AppError.js';
import config from '../../config/index.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('No token provided. Please log in');
    }

    const decoded = jwt.decode(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw AppError.forbidden('User account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }
    next(AppError.unauthorized('Invalid token'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Only ${roles.join(', ')} can access this resource`));
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.decode(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export default {
  authenticate,
  authorize,
  optionalAuth,
};
