import { Request, Response, NextFunction } from 'express';

/**
 * Custom request logger with timing
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Color based on status
    let statusColor = '\x1b[32m'; // Green
    if (statusCode >= 400) statusColor = '\x1b[33m'; // Yellow
    if (statusCode >= 500) statusColor = '\x1b[31m'; // Red

    console.log(
      `${method.padEnd(7)} ${originalUrl.padEnd(40)} ${statusColor}${statusCode}\x1b[0m ${duration}ms`
    );
  });

  next();
}