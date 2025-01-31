'user server';

import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { MiddlewareFactory } from '@nartix/next-middleware-chain/src';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { isPublicPath } from '@/lib/locale-util';

export const nextIntlMiddlewareFactory: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, response?: NextResponse) => {
    if (!isPublicPath(req.nextUrl.pathname)) {
      return next(req, event, createMiddleware(routing)(req));
    }
    return next(req, event, response);
  };
};
