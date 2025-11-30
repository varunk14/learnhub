import { prisma, UserRole } from '@learnhub/database';
import { NotFoundError } from '../types';
import { UpdateProfileInput } from '../validators/user.validator';
import { sanitizeUser, createPaginatedResult } from '../utils/helpers';
import { PaginationParams } from '../types';

export const userService = {
  /**
   * Get user by ID
   */
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
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
   * Get all users (admin only)
   */
  async getAll(pagination: PaginationParams, filters?: { role?: UserRole; search?: string }) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              enrollments: true,
              instructorCourses: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResult(
      users.map((u) => sanitizeUser(u)),
      total,
      pagination
    );
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return sanitizeUser(user);
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: UserRole) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return sanitizeUser(user);
  },

  /**
   * Deactivate user (admin only)
   */
  async deactivate(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  },

  /**
   * Activate user (admin only)
   */
  async activate(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return { message: 'User activated successfully' };
  },

  /**
   * Get instructor stats
   */
  async getInstructorStats(instructorId: string) {
    const [courses, enrollments, reviews] = await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.enrollment.count({
        where: { course: { instructorId } },
      }),
      prisma.review.aggregate({
        where: { course: { instructorId } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      totalCourses: courses,
      totalStudents: enrollments,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count,
    };
  },
};