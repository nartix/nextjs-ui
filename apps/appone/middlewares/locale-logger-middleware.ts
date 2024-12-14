'use server';

import { NextRequest } from 'next/server';
import { extractLocale, isLocaleSupported } from '@/lib/locale-util';

/**
 * Locale Logger Middleware
 * Logs the locale extracted from the request URL.
 */
export async function localeLoggerMiddleware(req: NextRequest): Promise<void> {
  const pathname = req.nextUrl.pathname;

  console.log(`Detected locale: ${extractLocale(pathname)}`);

  if (isLocaleSupported(pathname)) {
    console.log(`Locale is supported: ${extractLocale(pathname)}`);
  } else {
    console.log(`Locale is not supported: ${extractLocale(pathname)}`);
  }
}
