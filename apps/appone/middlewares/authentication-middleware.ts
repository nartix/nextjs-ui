'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { nextSecurityMiddleware } from '@nartix/next-security';
import { NextRequest, NextResponse } from 'next/server';
import { isLocaleSupported } from '@/middlewares/locale-logger-middleware';
import { getClientIp } from '@/lib/get-client-ip';
import { MiddlewareResult } from '@/types/middleware-result';

// way to overload sessionObj with custom properties
export const authenticationMiddleware = async (req: NextRequest, res?: NextResponse): Promise<MiddlewareResult> => {
  const sessionObj = {
    ipAddress: getClientIp(req.headers),
    urlPath: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || '',
  };
  return nextSecurityMiddleware(req, res, authConfig, sessionObj);
};
