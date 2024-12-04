'user server';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { authenticationMiddleware as authMiddleware } from '@nartix/auth-appone';
import { NextRequest } from 'next/server';
import { isLocaleSupported } from '@/middlewares/locale-logger-middleware';

export const authenticationMiddleware = async (req: NextRequest): Promise<void> => {
  if (!isLocaleSupported(req.nextUrl.pathname)) {
    return;
  }
  console.log('app authenticationMiddleware config', authConfig);
  return await authMiddleware(req, authConfig);
};
