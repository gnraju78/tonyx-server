import { Router } from 'express';
import * as serviceController from '../controllers/ServiceController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { idParamSchema, paginationQuerySchema } from '../validators/common.validator.js';
import {
  createServiceSchema,
  updateServiceSchema,
  searchServiceQuerySchema,
  categoryParamSchema,
  popularServicesQuerySchema,
} from '../validators/service.validator.js';

const router = Router();

// Public routes — /popular and /search must be declared before /:id
router.get('/', validate({ query: paginationQuerySchema }), serviceController.getAllServices);
router.get(
  '/popular',
  validate({ query: popularServicesQuerySchema }),
  serviceController.getPopularServices
);
router.get(
  '/search',
  validate({ query: searchServiceQuerySchema }),
  serviceController.searchServices
);
router.get(
  '/category/:category',
  validate({ params: categoryParamSchema, query: paginationQuerySchema }),
  serviceController.getServicesByCategory
);
router.get('/:id', validate({ params: idParamSchema }), serviceController.getServiceById);

// Protected routes (Admin/Manager only)
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  validate({ body: createServiceSchema }),
  serviceController.createService
);
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  validate({ params: idParamSchema, body: updateServiceSchema }),
  serviceController.updateService
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  validate({ params: idParamSchema }),
  serviceController.deleteService
);

export default router;
