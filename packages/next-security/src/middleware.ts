import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions, SessionObj } from '@nartix/next-security';
// import { createNextCsrfMiddleware } from '@nartix/next-csrf/src';

export const nextSecurityMiddleware = async (
  req: NextRequest,
  res: NextResponse,
  authOptions: AuthOptions,
  sessionObj: SessionObj = {}
): Promise<{ response: NextResponse; next: boolean }> => {
  const { sessionAdaptor, cookie } = authOptions;

  const sessionToken = atob(req.cookies.get(cookie.name!)?.value || '');
  if (!sessionToken) {
    return { response: res, next: true };
  }

  const updatedSessionObject = await sessionAdaptor.updateSession({
    ...sessionObj,
    [authOptions.session.sessionId!]: sessionToken,
  });

  const sessionTokenFromUpdatedSession = updatedSessionObject ? updatedSessionObject[authOptions.session.sessionId!] : null;

  if (sessionTokenFromUpdatedSession) {
    cookie.value = btoa(sessionTokenFromUpdatedSession);
    if (cookie.name) {
      res.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      });
    } else {
      console.error('Cookie name is undefined');
    }
  }

  return { response: res, next: true };
};
