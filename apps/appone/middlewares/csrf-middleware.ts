import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCsrf } from '@nartix/csrf-core';

export const nextCsrfMiddleware = async (
  req: NextRequest,
  res: NextResponse,
  options: {
    secret: string;
    algorithm?: AlgorithmIdentifier;
    tokenByteLength?: number;
    cookieName?: string;
    headerName?: string;
    maxAge?: number;
  }
): Promise<NextResponse> => {
  res.cookies.set('testcsrf', 'sefsaefsefsefef');
  try {
    const csrf = await getCsrf(options);
    const store = await cookies();
    const cookieName = options.cookieName ?? 'CSRF-TOKEN';
    const headerName = options.headerName ?? 'X-CSRF-TOKEN';
    const csrfCookie = store.get(cookieName);

    res.cookies.set('testcsrf', 'sefsaefsefsefef');
    if (!csrfCookie) {
      const token = btoa(await csrf.generateToken());
      const cookieOptions: { name: string; value: string; maxAge?: number } = {
        name: cookieName,
        value: token,
      };
      if (options.maxAge !== undefined) {
        cookieOptions.maxAge = options.maxAge;
      }
      store.set(cookieOptions);
      //   res.cookies.set('testcsrf', token);
    } else {
      res.headers.set(headerName, csrfCookie.value);
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
  }

  return res;
};
