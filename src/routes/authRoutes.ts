import { Router } from 'express';
import * as authController from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register
);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
