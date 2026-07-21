import type { NextFunction, Request, Response } from 'express';

/**
 * Defense-in-depth against NoSQL operator injection (e.g. `?role[$ne]=admin`,
 * which Express's default `qs` query parser turns into `{ role: { $ne: 'admin' } }`).
 * Zod's `.strict()` schemas are the primary defense (they reject unknown/
 * unexpected shapes outright); this strips `$`-prefixed and dotted keys from
 * any object that reaches this middleware as a second layer, replacing the
 * unmaintained `mongo-sanitize` package.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);
  next();
}

function sanitizeInPlace(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      sanitizeInPlace(item);
    }
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      continue;
    }
    sanitizeInPlace(value[key]);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !(value instanceof Date);
}
