import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description too long'),
  shortDesc: z
    .string()
    .max(300, 'Short description too long')
    .optional(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .default(0),
  discountPrice: z
    .number()
    .min(0, 'Discount price cannot be negative')
    .optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  language: z.string().default('English'),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const createSectionSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200)
    .trim(),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
});

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200)
    .trim(),
  description: z.string().max(1000).optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).default('VIDEO'),
  videoUrl: z.string().url('Invalid video URL').optional(),
  videoDuration: z.number().int().min(0).default(0),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().optional(),
  level: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'price', 'title', 'enrollments']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;