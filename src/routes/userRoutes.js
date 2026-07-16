import express from 'express';
import userController from '../controllers/UserController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);
router.put('/availability', authenticate, userController.updateAvailability);
router.post('/deactivate', authenticate, userController.deactivateAccount);

// Public routes
router.get('/barbers', userController.getBarbers);
router.get('/barbers/search', userController.searchBarbers);
router.get('/barbers/:id', userController.getBarberById);

export default router;
