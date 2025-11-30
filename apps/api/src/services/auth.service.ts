import { prisma, UserRole } from '@learnhub/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyToken } from '../utils/jwt';
import { 
  UnauthorizedError, 
  ConflictError, 
  NotFoundError,
  BadRequestError 
} from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { sanitizeUser } from '../utils/helpers';
import { cache } from '../config/redis';

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterInput) {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role as UserRole,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Please login with your social account');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check password
    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyToken(refreshToken);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  },

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
          take: 5,
          orderBy: { enrolledAt: 'desc' },
        },
        _count: {
          select: {
            enrollments: true,
            instructorCourses: true,
            certificates: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
  },

  /**
   * Logout - invalidate refresh token (stored in Redis)
   */
  async logout(userId: string, refreshToken: string) {
    // Add refresh token to blacklist
    await cache.set(`blacklist:${refreshToken}`, '1', 30 * 24 * 60 * 60); // 30 days
    return { message: 'Logged out successfully' };
  },
};