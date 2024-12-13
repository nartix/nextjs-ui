'use server';

import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions, SessionObj } from '@nartix/next-security';
import { nextCsrfMiddleware } from '@nartix/next-csrf';

export const nextSecurityMiddleware = async (
  req: NextRequest,
  res: NextResponse,
  authOptions: AuthOptions,
  sessionObj: SessionObj = {}
): Promise<{ response?: NextResponse; next?: boolean }> => {
  const { getCookie, setCookie, sessionAdaptor, session, cookie, csrf } = authOptions;

  const sessionToken = atob((await getCookie(cookie.name!)) || '');

  if (!sessionToken) {
    return { next: true };
  }

  // console.log('sessionObject', sessionObj);

  const updatedSessionObject = await sessionAdaptor.updateSession({
    ...sessionObj,
    [authOptions.session.sessionId!]: sessionToken,
  });

  const sessionTokenFromUpdatedSession = updatedSessionObject ? updatedSessionObject[authOptions.session.sessionId!] : null;

  // update cookie maxAge if session was updated
  if (sessionTokenFromUpdatedSession) {
    await setCookie(sessionTokenFromUpdatedSession, cookie);
  }

  const csrfResponse = await nextCsrfMiddleware(req, res, {
    secret: authOptions.secret!,
    algorithm: csrf.algorithm,
    tokenByteLength: csrf.tokenByteLength,
    cookieName: csrf.cookieName,
    headerName: csrf.headerName,
    maxAge: cookie.maxAge,
  });

  return { response: csrfResponse, next: true };
};
