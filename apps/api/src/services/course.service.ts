import { prisma, CourseStatus, Prisma } from '@learnhub/database';
import { NotFoundError, ForbiddenError } from '../types';
import { 
  CreateCourseInput, 
  UpdateCourseInput, 
  CourseQueryInput,
  CreateSectionInput,
  CreateLessonInput 
} from '../validators/course.validator';
import { createPaginatedResult, PaginationParams } from '../utils/helpers';
import { slugify } from '@learnhub/shared';
import { cache } from '../config/redis';

export const courseService = {
  /**
   * Create new course
   */
  async create(instructorId: string, data: CreateCourseInput) {
    // Generate unique slug
    let slug = slugify(data.title);
    const existingSlug = await prisma.course.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await prisma.course.create({
      data: {
        ...data,
        slug,
        instructorId,
        price: new Prisma.Decimal(data.price),
        discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
      },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });

    // Invalidate cache
    await cache.delPattern('courses:*');

    return course;
  },

  /**
   * Get course by ID or slug
   */
  async getByIdOrSlug(idOrSlug: string, includeUnpublished = false) {
    const where: Prisma.CourseWhereInput = {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    };

    if (!includeUnpublished) {
      where.status = CourseStatus.PUBLISHED;
    }

    const course = await prisma.course.findFirst({
      where,
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        category: true,
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                videoDuration: true,
                isFree: true,
                isPublished: true,
                order: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Get average rating
    const ratingAgg = await prisma.review.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true },
    });

    return {
      ...course,
      averageRating: ratingAgg._avg.rating || 0,
    };
  },

  /**
   * Get all courses with filters
   */
  async getAll(query: CourseQueryInput) {
    const { 
      page, 
      limit, 
      category, 
      level, 
      status,
      search, 
      minPrice, 
      maxPrice, 
      sortBy, 
      sortOrder 
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CourseWhereInput = {
      status: status || CourseStatus.PUBLISHED,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build orderBy
    let orderBy: Prisma.CourseOrderByWithRelationInput = { [sortBy]: sortOrder };
    
    if (sortBy === 'enrollments') {
      orderBy = { enrollments: { _count: sortOrder } };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          instructor: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return createPaginatedResult(courses, total, { page, limit, sortBy, sortOrder });
  },

  /**
   * Update course
   */
  async update(courseId: string, instructorId: string, data: UpdateCourseInput, isAdmin = false) {
    // Check ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (!isAdmin && course.instructorId !== instructorId) {
      throw new ForbiddenError('You can only update your own courses');
    }

    // Update slug if title changed
    let slug = course.slug;
    if (data.title && data.title !== course.title) {
      slug = slugify(data.title);
      const existingSlug = await prisma.course.findFirst({ 
        where: { slug, id: { not: courseId } } 
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...data,
        slug,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        discountPrice: data.discountPrice !== undefined 
          ? new Prisma.Decimal(data.discountPrice) 
          : undefined,
        publishedAt: data.status === 'PUBLISHED' && !course.publishedAt 
          ? new Date() 
          : undefined,
      },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });

    // Invalidate cache
    await cache.delPattern('courses:*');
    await cache.del(`course:${courseId}`);
    await cache.del(`course:${course.slug}`);

    return updated;
  },

  /**
   * Delete course
   */
  async delete(courseId: string, instructorId: string, isAdmin = false) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (!isAdmin && course.instructorId !== instructorId) {
      throw new ForbiddenError('You can only delete your own courses');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    // Invalidate cache
    await cache.delPattern('courses:*');

    return { message: 'Course deleted successfully' };
  },

  /**
   * Get instructor's courses
   */
  async getInstructorCourses(instructorId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
      }),
      prisma.course.count({ where: { instructorId } }),
    ]);

    return createPaginatedResult(courses, total, pagination);
  },

  /**
   * Add section to course
   */
  async addSection(courseId: string, instructorId: string, data: CreateSectionInput) {
    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== instructorId) {
      throw new ForbiddenError('You can only modify your own courses');
    }

    // Get max order
    const maxOrder = await prisma.section.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const section = await prisma.section.create({
      data: {
        ...data,
        courseId,
        order: data.order ?? (maxOrder._max.order || 0) + 1,
      },
      include: {
        lessons: true,
      },
    });

    return section;
  },

  /**
   * Add lesson to section
   */
  async addLesson(sectionId: string, instructorId: string, data: CreateLessonInput) {
    // Verify ownership
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section || section.course.instructorId !== instructorId) {
      throw new ForbiddenError('You can only modify your own courses');
    }

    // Get max order
    const maxOrder = await prisma.lesson.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        ...data,
        sectionId,
        order: data.order ?? (maxOrder._max.order || 0) + 1,
      },
    });

    // Update course stats
    await this.updateCourseStats(section.courseId);

    return lesson;
  },

  /**
   * Update course statistics
   */
  async updateCourseStats(courseId: string) {
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId } },
      select: { videoDuration: true },
    });

    const totalLessons = lessons.length;
    const duration = lessons.reduce((sum, l) => sum + l.videoDuration, 0);

    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons, duration },
    });
  },

  /**
   * Get categories
   */
  async getCategories() {
    // Try cache first
    const cached = await cache.get<any[]>('categories');
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
        children: {
          include: {
            _count: {
              select: { courses: true },
            },
          },
        },
      },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });

    // Cache for 1 hour
    await cache.set('categories', categories, 3600);

    return categories;
  },
};