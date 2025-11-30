import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCourseSchema,
  updateCourseSchema,
  createSectionSchema,
  createLessonSchema,
  courseQuerySchema,
} from '../validators/course.validator';

const router = Router();

// Public routes
router.get('/categories', courseController.getCategories);
router.get('/', validate(courseQuerySchema, 'query'), courseController.getAll);
router.get('/:idOrSlug', optionalAuth, courseController.getByIdOrSlug);

// Protected routes - Instructor/Admin
router.post(
  '/',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(createCourseSchema),
  courseController.create
);

router.get(
  '/my-courses',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  courseController.getMyCourses
);

router.patch(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(updateCourseSchema),
  courseController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  courseController.delete
);

// Sections & Lessons
router.post(
  '/:id/sections',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(createSectionSchema),
  courseController.addSection
);

router.post(
  '/sections/:sectionId/lessons',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(createLessonSchema),
  courseController.addLesson
);

export default router;