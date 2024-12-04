'use server';

import { NextRequest } from 'next/server';
import { AuthOptions } from '@nartix/auth-appone';

export const authenticationMiddleware = async (req: NextRequest, authOptions: AuthOptions): Promise<void> => {
  console.log('authone authenticationMiddleware authOptions', authOptions);
  const { getCookie, setCookie, sessionAdaptor, session, cookie } = authOptions;

  console.log('cookie', cookie);

  //   const sessionToken = atob((await getCookie(cookie.name!)) || '');

  //   if (!sessionToken) {
  //     return;
  //   }

  //   console.log('sessionToken from authenticate middleware', sessionToken);

  return;
};
