import { NextRequest, NextResponse } from 'next/server';
import { getCsrf } from '@nartix/csrf-core';

interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CsrfOptions extends CookieOptions {
  secret: string;
  algorithm?: AlgorithmIdentifier;
  tokenByteLength?: number;
  cookieName?: string;
  headerName?: string;
}

const DEFAULT_OPTIONS: Partial<CsrfOptions> = {
  cookieName: 'CSRF-TOKEN',
  headerName: 'X-CSRF-TOKEN',
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  domain: undefined,
};

const nextCsrfMiddleware = async (req: NextRequest, res: NextResponse, options: CsrfOptions): Promise<NextResponse> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  if (!mergedOptions.headerName || !mergedOptions.cookieName) {
    throw new Error('Both headerName and cookieName are required in CSRF options');
  }

  try {
    const csrf = await getCsrf(mergedOptions);
    const { cookieName, headerName } = mergedOptions;
    const csrfCookie = req.cookies.get(cookieName!);

    if (!csrfCookie) {
      const token = btoa(await csrf.generateToken());

      res.cookies.set(cookieName!, token, {
        path: mergedOptions.path,
        maxAge: mergedOptions.maxAge,
        httpOnly: mergedOptions.httpOnly!,
        secure: mergedOptions.secure!,
        sameSite: mergedOptions.sameSite!,
        domain: mergedOptions.domain,
      });
    } else {
      res.headers.set(headerName!, csrfCookie.value);
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
    // Optionally, you can set an error response here
    // return new NextResponse('Internal Server Error', { status: 500 });
  }

  return res;
};

export { nextCsrfMiddleware };
