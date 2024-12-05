import { cache } from 'react';
import { getServerSession as Session } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';

// Caching the session retrieval function to maintain a server-side session state per request.
export const getServerSession = cache(() => Session(authConfig));

export const getUncachedServerSession = () => Session(authConfig);
