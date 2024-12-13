'user server';

import { MiddlewareHandler } from '@/types/middleware-handler';

/**
 * Logger Middleware
 * Logs the incoming request URL.
 */
export const loggerMiddleware: MiddlewareHandler = async (req, res) => {
  console.log(`Request URL: ${req.url}`);
  return { next: true };
};
