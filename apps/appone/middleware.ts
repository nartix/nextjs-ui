import { NextRequest, NextResponse } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
import { combineMiddlewares } from '@/lib/combine-middlewares';
import { loggerMiddleware } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';
import { testMiddleware } from './middlewares/test-middleware';
import { isPublicPath } from '@/lib/locale-util';

export default async function middleware(req: NextRequest) {
  const middlewares = [];

  if (!isPublicPath(req.nextUrl.pathname)) {
    middlewares.push(nextIntlMiddleware);
  }

  middlewares.push(testMiddleware);
  middlewares.push(authenticationMiddleware);

  const combined = combineMiddlewares(...middlewares);
  return await combined(req, NextResponse.next());
}

export const config = {
  unstable_allowDynamic: [],
  // Match only internationalized pathnames
  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
