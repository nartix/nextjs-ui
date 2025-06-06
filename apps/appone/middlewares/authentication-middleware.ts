'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { nextSecurityMiddleware } from '@nartix/next-security/src';
import { getClientIp } from '@/lib/get-client-ip';
import { MiddlewareFactory } from '@nartix/next-middleware-chain/src';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

// Overloading sessionObj with custom properties
export const authenticationMiddlewareFactory: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, response?: NextResponse) => {
    console.log('authentication middleware url path', req.nextUrl.pathname);
    const sessionObj = {
      ipAddress: getClientIp(req.headers),
      urlPath: req.nextUrl.pathname,
      userAgent: req.headers.get('user-agent') || '',
    };
    return next(req, event, await nextSecurityMiddleware(req, response || NextResponse.next(), authConfig, sessionObj));
  };
};
