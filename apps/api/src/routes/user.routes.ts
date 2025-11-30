import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, updateUserRoleSchema } from '../validators/user.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/profile', userController.updateProfile); // GET current user profile
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.get('/instructor/stats', authorize('INSTRUCTOR', 'ADMIN'), userController.getInstructorStats);

// Admin only routes
router.get('/', authorize('ADMIN'), userController.getAll);
router.get('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), userController.getById);
router.patch('/:id/role', authorize('ADMIN'), validate(updateUserRoleSchema), userController.updateRole);
router.post('/:id/deactivate', authorize('ADMIN'), userController.deactivate);
router.post('/:id/activate', authorize('ADMIN'), userController.activate);

export default router;