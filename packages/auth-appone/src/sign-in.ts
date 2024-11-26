import { cookies } from 'next/headers';
import { setCookie, ProviderType } from '@nartix/auth-appone';
import { AuthOptions } from './auth';

export const signIn = async (authOptions: AuthOptions, credentials: unknown, providerId: ProviderType) => {
  const { providers, sessionAdaptor, authenticateWithProvider, cookie, session } = authOptions;

  const user = await authenticateWithProvider(providers, providerId, credentials);

  console.log('cookie', cookie);

  if (!user) {
    return null;
  }

  if (cookie?.maxAge) {
    const sessionData = await sessionAdaptor.createSession(user, cookie?.maxAge);

    if (session.sessionId) {
      await setCookie(sessionData[session.sessionId], cookies(), cookie);
    }
  }

  console.log('session', session);

  return user;
};
