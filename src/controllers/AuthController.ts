import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { authService } from '../services/AuthService.js';
import { UnauthorizedError } from '../utils/AppError.js';
import type { TypedRequest } from '../interfaces/http.interface.js';
import type { RegisterDto, LoginDto } from '../validators/auth.validator.js';

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authorizationHeader.slice('Bearer '.length).trim() || null;
}

export const register = asyncHandler<TypedRequest<RegisterDto>>(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 'User registered successfully', HttpStatus.CREATED);
});

export const login = asyncHandler<TypedRequest<LoginDto>>(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const result = await authService.refreshToken(token);
  sendSuccess(res, result, 'Token refreshed successfully');
});

export const getProfile = asyncHandler((req, res) => {
  sendSuccess(res, req.user, 'Profile retrieved successfully');
});

export const logout = asyncHandler((_req, res) => {
  sendSuccess(res, null, 'Logged out successfully');
});
