import { getTranslations } from 'next-intl/server';
import { Credentials, Provider } from '@nartix/next-security';
import { API_URL } from '@/config/server-config';

import { fetchWrapper } from '@/lib/fetch-wrapper';

export const credentialsProvider: Provider = {
  id: 'credentials',
  async authorize(credentials: Credentials) {
    const t = await getTranslations();

    if (!credentials) {
      throw new Error(t('auth.no_credentials'));
    }

    try {
      const response = await fetchWrapper(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const userInfo = await response.json();

      // Return user information
      return userInfo;
    } catch (error: unknown) {
      console.error(t('auth.error_in_authorize'), error);
      return null;
    }
  },
};
