import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { Provider, authenticateWithProvider, setCookie, auth } from '@nartix/auth-appone';
import { SessionAdaptor, SessionObj } from '@nartix/auth-appone/src/adaptors/session-adaptor';

export const signIn = async (provider: Provider, credentials: unknown, sessionAdaptor: SessionAdaptor) => {
  const user = await authenticateWithProvider(provider, credentials);

  // Get the current time in milliseconds (UNIX epoch time)
  const creationTime = Date.now();

  // Define the max inactive interval (30 minutes in seconds)
  const maxInactiveInterval = 1800;

  // Calculate the expiry time in milliseconds
  const expiryTime = creationTime + maxInactiveInterval * 1000;

  if (!user) {
    return null;
  }

  const sessionObj: SessionObj = {
    primaryId: uuidv4(),
    sessionId: uuidv4(),
    creationTime: creationTime,
    expiryTime: expiryTime, // 24 hours
    lastAccessTime: creationTime,
    maxInactiveInterval: maxInactiveInterval, // 1 hour
    userId: user.id,
    principalName: user.username,
  };

  const session = await sessionAdaptor.createSession(sessionObj);

  await setCookie(session.sessionId, cookies());

  console.log('session', session);

  return user;
};
