'use server';

import { NextRequest } from 'next/server';
import { AuthOptions, SessionObj } from '@nartix/next-security';

export const authenticationMiddleware = async (
  req: NextRequest,
  authOptions: AuthOptions,
  sessionObj: SessionObj = {}
): Promise<void> => {
  const { getCookie, setCookie, sessionAdaptor, session, cookie } = authOptions;

  // Get the IP address from the request
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  console.log('clientIp from authenticate middleware:', clientIp);

  // Split the string by ':' and get the last part
  const ipAddressCleaned = clientIp.split(':');

  const sessionToken = atob((await getCookie(cookie.name!)) || '');

  if (!sessionToken) {
    return;
  }

  const dbSessionObject = await sessionAdaptor.updateSession({
    ...sessionObj,
    sessionId: sessionToken,
  });

  // console.log('sessionObj from authenticate middleware:', sessionObj);

  //   console.log('sessionToken from authenticate middleware', sessionToken);

  return;
};
