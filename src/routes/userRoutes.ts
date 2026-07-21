import { Router } from 'express';
import * as userController from '../controllers/UserController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, paginationQuerySchema } from '../validators/common.validator.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateAvailabilitySchema,
  searchBarbersQuerySchema,
} from '../validators/user.validator.js';

const router = Router();

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put(
  '/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  userController.updateProfile
);
router.put(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  userController.changePassword
);
router.put(
  '/availability',
  authenticate,
  validate({ body: updateAvailabilitySchema }),
  userController.updateAvailability
);
router.post('/deactivate', authenticate, userController.deactivateAccount);

// Public routes — /search must be declared before /:id
router.get('/barbers', validate({ query: paginationQuerySchema }), userController.getBarbers);
router.get(
  '/barbers/search',
  validate({ query: searchBarbersQuerySchema }),
  userController.searchBarbers
);
router.get('/barbers/:id', validate({ params: idParamSchema }), userController.getBarberById);

export default router;
