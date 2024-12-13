'user server';

import { MiddlewareHandler } from '@/types/middleware-handler';

/**
 * Logger Middleware
 * Logs the incoming request URL.
 */
export const loggerMiddleware: MiddlewareHandler = async (req, res) => {
  if (req.headers.get('x-middleware-rewrite')) {
    console.log(`Request URL: ${req.url}`);
  }
  return { next: true };
};
