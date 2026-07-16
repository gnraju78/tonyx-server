import { sendSuccess, sendError } from '../utils/response.js';
import authService from '../services/AuthService.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await authService.refreshToken(token);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      sendSuccess(res, req.user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
