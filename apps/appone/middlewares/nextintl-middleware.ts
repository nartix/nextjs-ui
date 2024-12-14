'user server';

import createMiddleware from 'next-intl/middleware';
import { MiddlewareHandler } from '@/types/middleware-handler';
import { routing } from '@/i18n/routing';
import { isLocaleSupported, isPublicPath } from './locale-logger-middleware';

export const nextIntlMiddleware: MiddlewareHandler = async (req, res) => {
  // if locale is supported or public page, then no need to call next-intl middleware
  if (isLocaleSupported(req.nextUrl.pathname) || isPublicPath(req.nextUrl.pathname)) {
    return { response: res, next: true };
  }
  return { response: createMiddleware(routing)(req), next: true };
};
