'user server';

import { NextRequest, NextResponse } from 'next/server';
import { isLocaleSupported, extractLocale } from '@/middlewares/locale-logger-middleware';
import { MiddlewareResult } from '@/types/middleware-result';

/**
 * Logger Middleware
 * Logs the incoming request URL.
 */
export async function loggerMiddleware(req: NextRequest, res?: NextResponse): Promise<MiddlewareResult> {
  // Need this check because response rewrite causes middleware rerun from nextintl middleware
  // otherwise, this middleware will run twice on route / and /en
  if (res!.headers.get('x-middleware-rewrite')) {
    console.log(`Request URL: ${req.url}`);
  }

  // Continue to the next middleware if no redirect is needed
  return { propagate: true };
}
