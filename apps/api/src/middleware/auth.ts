import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UnauthorizedError, ForbiddenError } from '../types';
import { verifyToken } from '../utils/jwt';
import { prisma, UserRole } from '@learnhub/database';

/**
 * Authentication middleware
 * 
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    next();
  } catch {
    // Ignore token errors for optional auth
    next();
  }
}

/**
 * Role-based authorization middleware
 * 
 * Usage:
 *   router.get('/admin', authenticate, authorize('ADMIN'), handler);
 *   router.get('/manage', authenticate, authorize('ADMIN', 'INSTRUCTOR'), handler);
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

/**
 * Check if user is the owner of a resource
 * 
 * Usage:
 *   router.put('/courses/:id', authenticate, isOwner('instructorId'), handler);
 */
export function isOwnerOrAdmin(resourceUserIdField: string) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    // Admin can access anything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user ID in body/params matches authenticated user
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      return next(new ForbiddenError('You can only access your own resources'));
    }

    next();
  };
}