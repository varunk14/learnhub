import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']),
});

// Types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;