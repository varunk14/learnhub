import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  /**
   * POST /auth/register
   */
  register: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  }),

  /**
   * POST /auth/login
   */
  login: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),

  /**
   * POST /auth/refresh
   */
  refreshToken: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  }),

  /**
   * GET /auth/me
   */
  getCurrentUser: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);

    res.json({
      success: true,
      data: user,
    });
  }),

  /**
   * POST /auth/change-password
   */
  changePassword: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);

    res.json({
      success: true,
      ...result,
    });
  }),

  /**
   * POST /auth/logout
   */
  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(req.user!.id, refreshToken);

    res.json({
      success: true,
      ...result,
    });
  }),
};