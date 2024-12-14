'user server';

import createMiddleware from 'next-intl/middleware';
import { MiddlewareHandler } from '@/types/middleware-handler';
import { routing } from '@/i18n/routing';
import { isLocaleSupported } from './locale-logger-middleware';

export const nextIntlMiddleware: MiddlewareHandler = async (req, res) => {
  if (isLocaleSupported(req.nextUrl.pathname)) {
    console.log(`Locale is supported: ${req.nextUrl.pathname}`);
    return { response: res, next: true };
  }
  console.log('next intl middleware');
  return { response: createMiddleware(routing)(req), next: true };
};
