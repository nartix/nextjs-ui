import { NextRequest, NextResponse } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
// import { createMiddlewareChain } from '@/lib/middleware-chainer';
import { createMiddlewareChain } from '@nartix/next-middleware-chain/src';
import { loggerMiddleware } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';
import { testMiddleware } from '@/middlewares/test-middleware';
import { isPublicPath } from '@/lib/locale-util';
import { csrfMiddleware } from '@/middlewares/csrf-middleware';

export default async function middleware(req: NextRequest) {
  const middlewares = [];
  const res = NextResponse.next();

  if (!isPublicPath(req.nextUrl.pathname)) {
    middlewares.push(nextIntlMiddleware);
  }
  middlewares.push(csrfMiddleware);
  middlewares.push(testMiddleware);
  middlewares.push(authenticationMiddleware);

  const combined = createMiddlewareChain(...middlewares);
  return combined(req, res);
}

export const config = {
  unstable_allowDynamic: [],
  // Match only internationalized pathnames
  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
