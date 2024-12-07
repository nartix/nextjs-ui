'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { nextSecurityMiddleware } from '@nartix/next-security';
import { NextRequest } from 'next/server';
import { isLocaleSupported } from '@/middlewares/locale-logger-middleware';
import { getClientIp } from '@/lib/get-client-ip';

// way to overload sessionObj with custom properties
export const authenticationMiddleware = async (req: NextRequest): Promise<void> => {
  if (!isLocaleSupported(req.nextUrl.pathname)) {
    return;
  }
  const sessionObj = {
    ipAddress: getClientIp(req.headers),
    urlPath: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || '',
  };
  return await nextSecurityMiddleware(req, authConfig, sessionObj);
};
