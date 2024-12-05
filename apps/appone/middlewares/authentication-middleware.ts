'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { authenticationMiddleware as authMiddleware } from '@nartix/next-security';
import { NextRequest } from 'next/server';
import { isLocaleSupported } from '@/middlewares/locale-logger-middleware';
import { getClientIp } from '@/lib/get-client-ip';

export const authenticationMiddleware = async (req: NextRequest): Promise<void> => {
  if (!isLocaleSupported(req.nextUrl.pathname)) {
    return;
  }
  console.log('clientIp from authenticate middleware:', getClientIp(req.headers));
  return await authMiddleware(req, authConfig);
};
