import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to catch errors automatically
 * 
 * Without this:
 *   app.get('/users', async (req, res, next) => {
 *     try {
 *       const users = await getUsers();
 *       res.json(users);
 *     } catch (error) {
 *       next(error);  // Must remember this!
 *     }
 *   });
 * 
 * With this:
 *   app.get('/users', asyncHandler(async (req, res) => {
 *     const users = await getUsers();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;