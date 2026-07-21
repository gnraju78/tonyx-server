import type { Request } from 'express';

/**
 * Typed request helper for req.body/req.params. The actual runtime values
 * are guaranteed to match by the `validate()` middleware (see
 * middlewares/validate.ts) running ahead of every route that uses this.
 *
 * There's deliberately no `Query` generic here: Express's own
 * `Request<Params, ResBody, ReqBody, ReqQuery>` constrains ReqQuery to
 * extend `ParsedQs` (string-only values, matching the raw query string
 * before parsing), which no post-Zod-coercion type can satisfy once a
 * field becomes a real `number`/`Date`/etc. Any type that routes around
 * that constraint (e.g. via intersection) stops being assignable to
 * Express's `RequestHandler`, which is exactly what route registration
 * needs. Controllers that need a typed, validated query object use
 * `getValidatedQuery()` below instead — one documented cast at the single
 * point where Express's static typing and our runtime-validated data
 * genuinely diverge.
 */
export type TypedRequest<
  Body = unknown,
  Params extends Record<string, string> = Record<string, string>,
> = Request<Params, unknown, Body>;

/**
 * Reads `req.query` as the type `validate({ query: schema })` guarantees
 * it was parsed into at runtime. See the TypedRequest doc comment for why
 * this can't be expressed through Express's own Request generics.
 */
export function getValidatedQuery<T>(req: Request): T {
  return req.query as unknown as T;
}
