import { authenticationMiddlewareFactory } from '@/middlewares/authentication-middleware';
import { loggerMiddlewareFactory } from '@/middlewares/logger-middleware';
import { nextIntlMiddlewareFactory } from '@/middlewares/nextintl-middleware';
import { testMiddlewareFactory } from '@/middlewares/test-middleware';
import { csrfMiddlewareFactory } from '@/middlewares/csrf-middleware';
import { createMiddlewareChain } from '@nartix/next-middleware-chain';

const factories = [
  nextIntlMiddlewareFactory,
  csrfMiddlewareFactory,
  authenticationMiddlewareFactory,
  loggerMiddlewareFactory,
  testMiddlewareFactory,
];

export default createMiddlewareChain(factories);

export const config = {
  unstable_allowDynamic: [],
  // Match only internationalized pathnames
  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
