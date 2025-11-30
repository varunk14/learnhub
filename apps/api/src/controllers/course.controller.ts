import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { courseService } from '../services/course.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/helpers';

export const courseController = {
  /**
   * POST /courses
   */
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await courseService.create(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  }),

  /**
   * GET /courses
   */
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await courseService.getAll(req.query as any);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * GET /courses/:idOrSlug
   */
  getByIdOrSlug: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const includeUnpublished = req.user?.role === 'ADMIN' || req.user?.role === 'INSTRUCTOR';
    const course = await courseService.getByIdOrSlug(req.params.idOrSlug, includeUnpublished);

    res.json({
      success: true,
      data: course,
    });
  }),

  /**
   * PATCH /courses/:id
   */
  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const course = await courseService.update(req.params.id, req.user!.id, req.body, isAdmin);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  }),

  /**
   * DELETE /courses/:id
   */
  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const result = await courseService.delete(req.params.id, req.user!.id, isAdmin);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * GET /courses/my-courses
   */
  getMyCourses: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const result = await courseService.getInstructorCourses(req.user!.id, pagination);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * POST /courses/:id/sections
   */
  addSection: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const section = await courseService.addSection(req.params.id, req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: section,
    });
  }),

  /**
   * POST /courses/sections/:sectionId/lessons
   */
  addLesson: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lesson = await courseService.addLesson(req.params.sectionId, req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: lesson,
    });
  }),

  /**
   * GET /categories
   */
  getCategories: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const categories = await courseService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  }),
};