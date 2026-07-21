import rateLimit from 'express-rate-limit';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Auth endpoints (login/register) get a much tighter limit than general API
 * traffic — the original app applied the same 100-req/15min limit uniformly,
 * which is far too loose to slow down a credential-stuffing/brute-force
 * attempt against /auth/login.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.',
});
