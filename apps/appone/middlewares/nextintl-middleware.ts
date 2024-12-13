'user server';

import createMiddleware from 'next-intl/middleware';
import { MiddlewareHandler } from '@/types/middleware-handler';
import { routing } from '@/i18n/routing';

export const nextIntlMiddleware: MiddlewareHandler = async (req, res) => {
  return { response: createMiddleware(routing)(req), next: true };
};
