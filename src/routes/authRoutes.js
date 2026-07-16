import express from 'express';
import authController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
