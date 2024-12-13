import { NextRequest, NextResponse } from 'next/server';
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
  try {
    const csrf = await getCsrf(options);
    const cookieName = options.cookieName ?? 'CSRF-TOKEN';
    const headerName = options.headerName ?? 'X-CSRF-TOKEN';
    const csrfCookie = req.cookies.get(cookieName);

    if (!csrfCookie) {
      const token = btoa(await csrf.generateToken());
      res.cookies.set(cookieName, token, { maxAge: options.maxAge });
    } else {
      res.headers.set(headerName, csrfCookie.value);
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
  }

  return res;
};
