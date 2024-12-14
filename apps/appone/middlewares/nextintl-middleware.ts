'user server';

import createMiddleware from 'next-intl/middleware';
import { MiddlewareHandler } from '@/types/middleware-handler';
import { routing } from '@/i18n/routing';
import { isLocaleSupported, isPublicPath } from '@/lib/locale-util';

export const nextIntlMiddleware: MiddlewareHandler = async (req, res) => {
  console.log('nextIntlMiddleware run ======');
  return { response: createMiddleware(routing)(req), next: true };
};
