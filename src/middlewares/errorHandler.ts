import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendError } from '../utils/response.js';
import { isAppError, ValidationError } from '../utils/AppError.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { logger } from '../config/logger.js';

interface MongoServerErrorLike extends Error {
  code?: number;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Resource not found. Invalid: ${err.path}`, HttpStatus.BAD_REQUEST);
    return;
  }

  const mongoErr = err as MongoServerErrorLike;
  if (mongoErr.code === 11000) {
    sendError(res, 'Duplicate field value entered', HttpStatus.BAD_REQUEST);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token. Please log in again', HttpStatus.UNAUTHORIZED);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token has expired. Please log in again', HttpStatus.UNAUTHORIZED);
    return;
  }

  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (isAppError(err)) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  sendError(res, 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
}
