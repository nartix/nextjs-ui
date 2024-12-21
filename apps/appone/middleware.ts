import { NextRequest, NextResponse } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
// import { createMiddlewareChain } from '@/lib/middleware-chainer';
import { createMiddlewareChain } from '@nartix/next-middleware-chain';
import { loggerMiddleware } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';
import { testMiddleware } from './middlewares/test-middleware';
import { isPublicPath } from '@/lib/locale-util';

export default async function middleware(req: NextRequest) {
  const middlewares = [];
  const response = NextResponse.next();

  if (!isPublicPath(req.nextUrl.pathname)) {
    middlewares.push(nextIntlMiddleware);
  }

  middlewares.push(testMiddleware);
  middlewares.push(authenticationMiddleware);

  const combined = createMiddlewareChain(...middlewares);
  return combined(req, response);
}

export const config = {
  unstable_allowDynamic: [],
  // Match only internationalized pathnames
  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
