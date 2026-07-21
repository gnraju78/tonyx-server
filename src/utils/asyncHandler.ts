import type { NextFunction, Request, Response } from 'express';

type RequestHandlerFn<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => unknown;

/**
 * Wraps a controller so rejected promises reach the global error handler
 * via next(), instead of needing a try/catch in every method. Accepts
 * sync handlers too (e.g. ones that don't actually await anything) without
 * forcing an unnecessary `async` keyword at the call site.
 */
export function asyncHandler<Req extends Request = Request>(
  handler: RequestHandlerFn<Req>
): (req: Req, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
