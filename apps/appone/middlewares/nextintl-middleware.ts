import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';

export const nextIntlMiddleware = createMiddleware(routing);
