import { setCookie, ProviderType } from '@nartix/next-security';
import { AuthOptions } from './auth';

// cookies can only be set in server action or page handlers in Next.js
export async function signIn(authOptions: AuthOptions, credentials: unknown, providerId: ProviderType) {
  const { providers, sessionAdaptor, authenticateWithProvider, cookie, session } = authOptions;

  const user = await authenticateWithProvider(providers, providerId, credentials);

  if (!user) {
    return null;
  }

  // Create session and set cookie
  const sessionData = await sessionAdaptor.createSession(user, cookie.maxAge!);
  const sessionToken = sessionData[session.sessionId!];

  if (sessionToken) {
    await setCookie(sessionToken, cookie);
  }

  console.log('session', session);

  return user;
}
