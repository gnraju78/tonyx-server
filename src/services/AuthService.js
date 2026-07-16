import jwt from 'jwt-simple';
import { AppError } from '../utils/AppError.js';
import config from '../../config/index.js';
import userRepository from '../repositories/UserRepository.js';

export class AuthService {
  async register(userData) {
    const { email, phone, password, firstName, lastName, role } = userData;

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    const phoneUser = await userRepository.findByPhone(phone);
    if (phoneUser) {
      throw AppError.conflict('Phone number already registered');
    }

    // Create user
    const user = await userRepository.create({
      email,
      phone,
      password,
      firstName,
      lastName,
      role: role || 'customer',
      isActive: true,
    });

    return this.generateAuthResponse(user);
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.forbidden('User account is inactive');
    }

    await userRepository.updateLastLogin(user._id);

    return this.generateAuthResponse(user);
  }

  async generateToken(userId) {
    return jwt.encode(
      { id: userId, iat: Math.floor(Date.now() / 1000) },
      config.jwt.secret
    );
  }

  generateAuthResponse(user) {
    const token = jwt.encode(
      { id: user._id, iat: Math.floor(Date.now() / 1000) },
      config.jwt.secret
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        rating: user.rating,
      },
      token,
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.decode(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw AppError.unauthorized('Invalid token');
    }
  }

  async refreshToken(oldToken) {
    try {
      const decoded = await this.verifyToken(oldToken);
      const user = await userRepository.findById(decoded.id);

      if (!user || !user.isActive) {
        throw AppError.unauthorized('User not found or inactive');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw AppError.unauthorized('Token refresh failed');
    }
  }
}

export default new AuthService();
