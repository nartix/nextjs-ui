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

  const dbSessionObject = await sessionAdaptor.updateSession({
    ...sessionObj,
    [authOptions.session.sessionId!]: sessionToken,
  });

  // console.log('sessionObj from authenticate middleware:', sessionObj);

  //   console.log('sessionToken from authenticate middleware', sessionToken);

  return;
};
