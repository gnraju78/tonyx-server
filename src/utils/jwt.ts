import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { config } from '../config/env.js';
import { UnauthorizedError } from './AppError.js';
import type { JwtPayload } from '../interfaces/auth.interface.js';

const ALGORITHM = 'HS256';

export function signToken(userId: Types.ObjectId | string): string {
  return jwt.sign({ id: userId.toString() }, config.jwt.secret, {
    algorithm: ALGORITHM,
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: [ALGORITHM] });

    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'string' ||
      typeof decoded.iat !== 'number'
    ) {
      throw new UnauthorizedError('Invalid token payload');
    }

    return { id: decoded.id, iat: decoded.iat };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}
