import type { Response } from 'express';
import { HttpStatus, type HttpStatusCode } from '../constants/httpStatus.js';

export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly pages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

interface SuccessEnvelope<T> {
  readonly success: true;
  readonly message: string;
  readonly data: T;
  readonly meta: {
    readonly timestamp: string;
    readonly pagination?: PaginationMeta;
  };
}

interface ErrorEnvelope {
  readonly success: false;
  readonly message: string;
  readonly data: null;
  readonly meta: {
    readonly timestamp: string;
    readonly errors?: ReadonlyArray<{ field: string; message: string }>;
  };
}

// Controllers receive `res: Response` from Express's `RequestHandler` with
// its ResBody generic left at the default `any` — threading a concrete
// ResBody through every route handler just to satisfy this call wouldn't
// buy real safety (the body shape is defined once, here, not per-route), so
// each function narrows its own return type instead and disables the one
// resulting `no-unsafe-return` on `res.json(...)`, whose actual shape is
// fully specified above.

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: HttpStatusCode = HttpStatus.OK
): Response<SuccessEnvelope<T>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export function sendPaginatedSuccess<T>(
  res: Response,
  data: T,
  pagination: { total: number; page: number; limit: number },
  message = 'Success',
  statusCode: HttpStatusCode = HttpStatus.OK
): Response<SuccessEnvelope<T>> {
  const pages = Math.ceil(pagination.total / pagination.limit);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
        hasNext: pagination.page < pages,
        hasPrev: pagination.page > 1,
      },
    },
  });
}

export function sendError(
  res: Response,
  message = 'Error',
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  errors?: ReadonlyArray<{ field: string; message: string }>
): Response<ErrorEnvelope> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...(errors && { errors }),
    },
  });
}
