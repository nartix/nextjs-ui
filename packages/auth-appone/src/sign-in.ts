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

  // Create session and set cookie
  const sessionData = await sessionAdaptor.createSession(user, session.maxAge!);
  const sessionToken = sessionData[session.sessionId!];

  if (sessionToken) {
    await setCookie(sessionToken, cookies(), cookie);
  }

  console.log('session', session);

  return user;
};
