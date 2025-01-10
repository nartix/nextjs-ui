import 'server-only';
import { routing, Locale } from '@/i18n/routing';

/**
 * Checks if the locale is supported by routing.
 * @param pathname - The pathname to extract the locale from.
 * @returns True if the locale is supported, false otherwise.
 */
export function isLocaleSupported(pathname: string): boolean {
  return matchLocaleRegex(pathname);
}

export function matchLocaleInclude(pathname: string): boolean {
  return routing.locales.includes(extractLocale(pathname) as Locale);
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

export function matchLocaleRegex(pathname: string): boolean {
  const regex = new RegExp(`^/(${routing.locales.join('|')})(/|$)`, 'i');
  return regex.test(pathname);
}

/**
 * Public pages that don't require locale logging.
 * For public page /test, it will match /test and /test/ and /en/test and /en/test/
 */
const publicPages = ['/404', '/500'];
export function isPublicPath(pathname: string): boolean {
  const regex = new RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  );
  return regex.test(pathname);
}
