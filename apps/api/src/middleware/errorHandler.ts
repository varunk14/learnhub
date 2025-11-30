import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../types';
import { config } from '../config';
import { Prisma } from '@learnhub/database';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * 
 * This catches ALL errors and sends appropriate response
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  console.error('❌ Error:', {
    message: err.message,
    stack: config.isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
      ...(config.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });

    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
          field: (err.meta?.target as string[])?.join(', '),
        });
        return;

      case 'P2025': // Record not found
        res.status(404).json({
          success: false,
          message: 'Record not found',
        });
        return;

      case 'P2003': // Foreign key constraint failed
        res.status(400).json({
          success: false,
          message: 'Related record not found',
        });
        return;

      default:
        res.status(500).json({
          success: false,
          message: 'Database error',
          ...(config.isDevelopment && { code: err.code }),
        });
        return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: config.isProduction ? 'Internal server error' : err.message,
    ...(config.isDevelopment && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
}