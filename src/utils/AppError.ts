import { HttpStatus, type HttpStatusCode } from '../constants/httpStatus.js';

export abstract class AppError extends Error {
  abstract readonly statusCode: HttpStatusCode;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = HttpStatus.BAD_REQUEST;
}

export class UnauthorizedError extends AppError {
  readonly statusCode = HttpStatus.UNAUTHORIZED;
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = HttpStatus.FORBIDDEN;
  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  constructor(message = 'Resource already exists') {
    super(message);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly errors: ReadonlyArray<{ field: string; message: string }>;

  constructor(
    errors: ReadonlyArray<{ field: string; message: string }>,
    message = 'Validation error'
  ) {
    super(message);
    this.errors = errors;
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(message = 'Internal server error') {
    super(message);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
