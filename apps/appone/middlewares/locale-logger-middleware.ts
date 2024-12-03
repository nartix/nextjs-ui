import { routing } from '@/i18n/routing';
import { NextRequest } from 'next/server';

/**
 * Locale Logger Middleware
 * Logs the locale extracted from the request URL.
 */
export function localeLogger(req: NextRequest): void {
  const [, locale, ..._segments] = req.nextUrl.pathname.split('/');

  console.log(`Detected locale: ${locale}`);

  if (routing.locales.includes(locale as any)) {
    console.log(`Locale is supported: ${locale}`);
  } else {
    console.log(`Locale is not supported: ${locale}`);
  }
}
