'use server';

import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
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

/**
 * Checks if the locale is supported by routing.
 * @param pathname - The pathname to extract the locale from.
 * @returns True if the locale is supported, false otherwise.
 */
export function isLocaleSupported(pathname: string): boolean {
  return routing.locales.includes(extractLocale(pathname) as any);
}

/**
 * Extracts the locale from the pathname.
 * @param pathname - The pathname to extract the locale from.
 * @returns The extracted locale.
 */
export function extractLocale(pathname: string): string {
  const [, locale] = pathname.split('/');
  return locale;
}
