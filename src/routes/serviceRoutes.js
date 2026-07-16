import express from 'express';
import serviceController from '../controllers/ServiceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/search', serviceController.searchServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/:id', serviceController.getServiceById);

// Protected routes (Admin/Manager only)
router.post('/', authenticate, authorize('admin', 'manager'), serviceController.createService);
router.put('/:id', authenticate, authorize('admin', 'manager'), serviceController.updateService);
router.delete('/:id', authenticate, authorize('admin', 'manager'), serviceController.deleteService);

export default router;
