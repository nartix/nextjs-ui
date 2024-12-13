import { NextRequest } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
import { combineMiddlewares } from '@/lib/combine-middlewares';
import { loggerMiddleware } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';

export default async function middleware(req: NextRequest) {
  const middlewares = [nextIntlMiddleware, loggerMiddleware, authenticationMiddleware];
  const combined = combineMiddlewares(...middlewares);
  return await combined(req);
}

export const config = {
  unstable_allowDynamic: [],
  // Match only internationalized pathnames
  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
