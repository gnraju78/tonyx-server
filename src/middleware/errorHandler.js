import { sendError } from '../utils/response.js';
import { AppError, ValidationError } from '../utils/AppError.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    const error = new AppError(message, 400);
    return sendError(res, error.message, error.statusCode);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    const error = new AppError(message, 400);
    return sendError(res, error.message, error.statusCode);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid token. Please log in again`;
    const error = new AppError(message, 401);
    return sendError(res, error.message, error.statusCode);
  }

  if (err.name === 'TokenExpiredError') {
    const message = `Token has expired. Please log in again`;
    const error = new AppError(message, 401);
    return sendError(res, error.message, error.statusCode);
  }

  // Operational errors
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // Validation errors
  if (err instanceof ValidationError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Log unexpected errors
  console.error('UNHANDLED ERROR:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  return sendError(res, 'Internal Server Error', 500);
};

export default errorHandler;
