import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to disable response caching for dynamic API endpoints.
 * Sets Cache-Control, Pragma, and Expires headers.
 */
export const preventCache = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};
