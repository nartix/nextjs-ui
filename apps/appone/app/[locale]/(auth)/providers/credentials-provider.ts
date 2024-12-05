import { getTranslations } from 'next-intl/server';
import { Credentials, Provider } from '@nartix/next-security';

import fetchWrapper from '@/lib/fetch-wrapper';

const API_BASE_URL = process.env.API_URL_GLOBAL;
const API_VERSION = process.env.API_URL_VERSION;
const API_PREFIX = process.env.API_URL_PREFIX;

export const credentialsProvider: Provider = {
  id: 'credentials',
  async authorize(credentials: Credentials) {
    const t = await getTranslations();

    if (!credentials) {
      throw new Error(t('auth.no_credentials'));
    }

    try {
      const response = await fetchWrapper(`${API_BASE_URL}/${API_PREFIX}/${API_VERSION}/auth/login`, {
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
    } catch (error: any) {
      console.error(t('auth.error_in_authorize'), error);
      return null;
    }
  },
};
