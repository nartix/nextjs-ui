'use server';

import { NextRequest } from 'next/server';
import { AuthOptions, SessionObj } from '@nartix/next-security';

export const nextSecurityMiddleware = async (
  req: NextRequest,
  authOptions: AuthOptions,
  sessionObj: SessionObj = {}
): Promise<void> => {
  const { getCookie, setCookie, sessionAdaptor, session, cookie } = authOptions;

  const sessionToken = atob((await getCookie(cookie.name!)) || '');

  if (!sessionToken) {
    return;
  }

  console.log('sessionObject', sessionObj);

  const updatedSessionObject = await sessionAdaptor.updateSession({
    ...sessionObj,
    [authOptions.session.sessionId!]: sessionToken,
  });

  const sessionTokenFromUpdatedSession = updatedSessionObject ? updatedSessionObject[authOptions.session.sessionId!] : null;

  // update cookie maxAge if session was updated
  if (sessionTokenFromUpdatedSession) {
    await setCookie(sessionTokenFromUpdatedSession, cookie);
  }

  return;
};
