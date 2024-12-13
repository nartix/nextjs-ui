'user server';

import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import { MiddlewareResult } from '@/types/middleware-result';

// export const nextIntlMiddleware = createMiddleware(routing);

// 'use server';

import { NextRequest, NextResponse } from 'next/server';
// import { routing } from '@/i18n/routing';
// import createMiddleware from 'next-intl/middleware';

const originalMiddleware = createMiddleware(routing);

export const nextIntlMiddleware = async (req: NextRequest, res?: NextResponse): Promise<MiddlewareResult> => {
  const response = originalMiddleware(req);

  return { response, propagate: true };
};
