import { NextRequest, NextResponse } from 'next/server';
import { combineMiddlewares } from '@/lib/combine-middlewares';
import { localeLogger } from '@/middlewares/locale-logger-middleware';
import { logger } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';

/**
 * Middleware chain for the app.
 * @param req - The incoming request object.
 * @returns The response object.
 */

export async function middleware(req: NextRequest) {
  // Combine all middleware functions
  // nextIntlMiddleware must be last in the chain
  // as it returns a response object
  const combined = combineMiddlewares(logger, localeLogger, nextIntlMiddleware);

  // Execute the combined middleware chain
  return await combined(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*', '/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
