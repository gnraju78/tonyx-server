import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { ValidationError } from '../utils/AppError.js';

interface ValidationTargets {
  readonly body?: ZodTypeAny;
  readonly params?: ZodTypeAny;
  readonly query?: ZodTypeAny;
}

/**
 * Validates and replaces req.body/params/query with the parsed (and typed)
 * result. Using `.strict()` schemas upstream means unknown keys — including
 * Mongo operator-shaped keys like `$gt` — are rejected here rather than
 * silently passed through to a repository filter.
 */
export function validate(targets: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Zod's type-erased `ZodTypeAny.parse()` returns `any`; each result is
      // routed through `unknown` and re-asserted to the field's original
      // Express type. This is a deliberate, intentional override — replacing
      // req.body/params/query with parsed-and-coerced data is the entire
      // point of this middleware.
      if (targets.body) {
        req.body = targets.body.parse(req.body) as unknown;
      }
      if (targets.params) {
        req.params = targets.params.parse(req.params) as unknown as typeof req.params;
      }
      if (targets.query) {
        req.query = targets.query.parse(req.query) as unknown as typeof req.query;
      }
      next();
    } catch (error) {
      next(toValidationError(error));
    }
  };
}

function toValidationError(error: unknown): ValidationError {
  if (isZodError(error)) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
    return new ValidationError(errors);
  }

  return new ValidationError([{ field: '(root)', message: 'Invalid request' }]);
}

function isZodError(error: unknown): error is z.ZodError {
  return typeof error === 'object' && error !== null && 'issues' in error;
}
