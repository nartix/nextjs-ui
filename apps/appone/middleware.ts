import { NextRequest, NextResponse } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
import { combineMiddlewares } from '@/lib/combine-middlewares';
import { localeLogger } from '@/middlewares/locale-logger-middleware';
import { logger } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { getServerSession } from './app/[locale]/(auth)/get-server-session';
import { auth } from '@nartix/auth-appone';

/**
 * Middleware chain for the app.
 * @param req - The incoming request object.
 * @returns The response object.
 */

export default async function middleware(req: NextRequest) {
  // const testcongfig = testAuthOptions;
  // console.log('middleware root  testcongfig', testcongfig);
  // console.log('awaitttttttt', await testcongfig.sessionAdaptor?.createSession({ username: 'test', id: 23423 }, 1800));
  // // console.log('middleware root  authconfig', authConfig);
  // Combine all middleware functions
  // nextIntlMiddleware must be last in the chain
  // as it returns a response object
  const combined = combineMiddlewares(logger, localeLogger, authenticationMiddleware, nextIntlMiddleware);
  // const response = nextIntlMiddleware(req);

  // Execute the combined middleware chain
  return await combined(req);
  // return response;
}

export const config = {
  unstable_allowDynamic: [
    '/app/[locale]/(auth)/auth-options.ts',
    //   '/node_modules/**',
    //   '/node_modules/function-bind/**',
    //   // './../../packages/auth-appone/src/**',
    //   '/middlewares/**', // Allows a single file '/node_modules/function-bind/**', // Allows anything in the function-bind module
  ],
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*', '/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
