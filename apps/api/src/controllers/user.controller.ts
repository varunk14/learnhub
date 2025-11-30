import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/helpers';

export const userController = {
  /**
   * GET /users
   */
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const filters = {
      role: req.query.role as any,
      search: req.query.search as string,
    };

    const result = await userService.getAll(pagination, filters);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * GET /users/:id
   */
  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.getById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  }),

  /**
   * PATCH /users/profile
   */
  updateProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.updateProfile(req.user!.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }),

  /**
   * PATCH /users/:id/role
   */
  updateRole: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.updateRole(req.params.id, req.body.role);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  }),

  /**
   * POST /users/:id/deactivate
   */
  deactivate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await userService.deactivate(req.params.id);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * POST /users/:id/activate
   */
  activate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await userService.activate(req.params.id);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * GET /users/instructor/stats
   */
  getInstructorStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await userService.getInstructorStats(req.user!.id);

    res.json({
      success: true,
      data: stats,
    });
  }),
};