'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { nextSecurityMiddleware } from '@nartix/next-security';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/get-client-ip';
import { MiddlewareHandler } from '@/types/middleware-handler';

// way to overload sessionObj with custom properties
export const authenticationMiddleware: MiddlewareHandler = async (req, res) => {
  // if (req.headers.get('x-middleware-rewrite')) {
  //   console.log('not contain rewrite: ', req.url);
  //   return { next: true };
  // }
  console.log('authentication middleware url path', req.nextUrl.pathname);
  const sessionObj = {
    ipAddress: getClientIp(req.headers),
    urlPath: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || '',
  };
  return await nextSecurityMiddleware(req, res!, authConfig, sessionObj);
};
