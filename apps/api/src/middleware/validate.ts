import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../types';

/**
 * Validation middleware factory
 * 
 * Usage:
 *   router.post('/users', validate(createUserSchema), handler);
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate and transform data
      const data = await schema.parseAsync(req[source]);
      
      // Replace with validated/transformed data
      req[source] = data;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((e) => {
          const path = e.path.join('.') || 'value';
          if (!errors[path]) errors[path] = [];
          errors[path].push(e.message);
        });

        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate multiple sources at once
 */
export function validateRequest(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Record<string, string[]> = {};

      if (schemas.body) {
        try {
          req.body = await schemas.body.parseAsync(req.body);
        } catch (e) {
          if (e instanceof ZodError) {
            e.errors.forEach((err) => {
              const path = `body.${err.path.join('.')}`;
              if (!errors[path]) errors[path] = [];
              errors[path].push(err.message);
            });
          }
        }
      }

      if (schemas.query) {
        try {
          req.query = await schemas.query.parseAsync(req.query);
        } catch (e) {
          if (e instanceof ZodError) {
            e.errors.forEach((err) => {
              const path = `query.${err.path.join('.')}`;
              if (!errors[path]) errors[path] = [];
              errors[path].push(err.message);
            });
          }
        }
      }

      if (schemas.params) {
        try {
          req.params = await schemas.params.parseAsync(req.params);
        } catch (e) {
          if (e instanceof ZodError) {
            e.errors.forEach((err) => {
              const path = `params.${err.path.join('.')}`;
              if (!errors[path]) errors[path] = [];
              errors[path].push(err.message);
            });
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        return next(new ValidationError('Validation failed', errors));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}