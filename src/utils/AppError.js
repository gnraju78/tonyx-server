export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  static serverError(message = 'Internal server error') {
    return new AppError(message, 500);
  }

  static validationError(message = 'Validation error') {
    return new AppError(message, 422);
  }
}

export class ValidationError extends AppError {
  constructor(errors) {
    super('Validation Error', 422);
    this.errors = errors;
  }
}

export default AppError;
