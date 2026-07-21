import type { NextFunction, Request, Response } from 'express';
import { userRepository } from '../repositories/UserRepository.js';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthUser } from '../interfaces/auth.interface.js';
import type { UserRole } from '../constants/roles.js';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim() || null;
}

async function loadAuthUser(token: string): Promise<AuthUser> {
  const decoded = verifyToken(token);
  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  if (!user.isActive) {
    throw new ForbiddenError('User account is inactive');
  }

  return { id: user._id, email: user.email, role: user.role, isActive: user.isActive };
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedError('No token provided. Please log in');
  }

  req.user = await loadAuthUser(token);
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req);
  if (token) {
    try {
      req.user = await loadAuthUser(token);
    } catch {
      // Optional auth: an invalid/expired token simply means anonymous access.
    }
  }
  next();
});

export function authorize(...roles: readonly UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Not authenticated'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Only ${roles.join(', ')} can access this resource`));
      return;
    }

    next();
  };
}
