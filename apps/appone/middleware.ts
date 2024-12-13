import { NextRequest, NextResponse } from 'next/server';
import { authenticationMiddleware } from '@/middlewares/authentication-middleware';
import { combineMiddlewares } from '@/lib/combine-middlewares';
import { localeLoggerMiddleware, isLocaleSupported } from '@/middlewares/locale-logger-middleware';
import { loggerMiddleware } from '@/middlewares/logger-middleware';
import { nextIntlMiddleware } from '@/middlewares/nextintl-middleware';
import { routing } from '@/i18n/routing';
import { auth } from '@nartix/next-security';

const publicPages: any[] = ['/', '/login'];
const locales = routing.locales;
console.log('locales', locales);

// export const nextIntlMiddleware = createMiddleware(routing);

const publicPathnameRegex = RegExp(
  `^(/(${locales.join('|')}))?(${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
  'i'
);

export default async function middleware(req: NextRequest) {
  // const combined = combineMiddlewares(nextIntlMiddleware, loggerMiddleware, localeLoggerMiddleware, authenticationMiddleware);
  const combined = combineMiddlewares(nextIntlMiddleware, loggerMiddleware, authenticationMiddleware);
  return await combined(req);
}

export const config = {
  unstable_allowDynamic: [
    // '/app/[locale]/(auth)/auth-options.ts',
    //   '/node_modules/**',
    //   '/node_modules/function-bind/**',
    // './../../packages/auth-appone/src/**',
    //   '/middlewares/**', // Allows a single file '/node_modules/function-bind/**', // Allows anything in the function-bind module
  ],
  // Match only internationalized pathnames

  // '/(fr|en)/:path*'
  // '/', `/${locales.join('|')}/:path*`,
  matcher: ['/((?!_next|_vercel|.*\\..*|api|favicon.ico|sitemap.xml|robots.txt).*)'],
};
