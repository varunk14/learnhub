// ============================================
// USER TYPES
// ============================================
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COURSE TYPES
// ============================================
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  status: CourseStatus;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number; // in seconds
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ENROLLMENT TYPES
// ============================================
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  enrolledAt: Date;
  completedAt?: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// AUTH TYPES
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}