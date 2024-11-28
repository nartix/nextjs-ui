import { setCookie, ProviderType } from '@nartix/auth-appone';
import { AuthOptions } from './auth';

// cookies can only be set in server action or page handlers in Next.js
export const signIn = async (authOptions: AuthOptions, credentials: unknown, providerId: ProviderType) => {
  const { providers, sessionAdaptor, authenticateWithProvider, cookie, session } = authOptions;

  const user = await authenticateWithProvider(providers, providerId, credentials);

  if (!user) {
    return null;
  }

  // Create session and set cookie
  const sessionData = await sessionAdaptor.createSession(user, session.maxAge!);
  const sessionToken = sessionData[session.sessionId!];

  if (sessionToken) {
    await setCookie(sessionToken, cookie);
  }

  console.log('session', session);

  return user;
};
