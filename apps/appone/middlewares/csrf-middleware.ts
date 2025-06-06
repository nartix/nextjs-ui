import 'server-only';
import { MiddlewareFactory } from '@nartix/next-middleware-chain/src';
import { createNextCsrfMiddleware } from '@nartix/next-csrf/src';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

// export const csrfMiddleware: MiddlewareHandler = async (req, res) => {
//   console.log('csrf middleware run =======');
//   const result = await createNextCsrfMiddleware(req, res, {
//     secret: process.env.CSRF_SECRET,
//     algorithm: process.env.CSRF_ALGORITHM,
//     tokenByteLength: process.env.CSRF_SALT_LENGTH ? parseInt(process.env.CSRF_SALT_LENGTH, 10) : undefined,
//     headerName: process.env.CSRF_HEADER_NAME,
//     cookie: {
//       name: process.env.CSRF_COOKIE_NAME,
//       maxAge: process.env.CSRF_COOKIE_MAXAGE ? parseInt(process.env.CSRF_COOKIE_MAXAGE, 10) : undefined,
//       secure: process.env.NODE_ENV === 'production',
//     },
//   });
//   return { response: result, next: true };
// };

export const csrfMiddlewareFactory: MiddlewareFactory =
  (next) => async (req: NextRequest, event: NextFetchEvent, response?: NextResponse) => {
    console.log('csrf middleware run =======');
    const result = await createNextCsrfMiddleware(req, response || NextResponse.next(), {
      secret: process.env.CSRF_SECRET,
      algorithm: process.env.CSRF_ALGORITHM,
      tokenByteLength: process.env.CSRF_SALT_LENGTH ? parseInt(process.env.CSRF_SALT_LENGTH, 10) : undefined,
      headerName: process.env.CSRF_HEADER_NAME,
      cookie: {
        name: process.env.CSRF_COOKIE_NAME,
        maxAge: process.env.CSRF_COOKIE_MAXAGE ? parseInt(process.env.CSRF_COOKIE_MAXAGE, 10) : undefined,
        secure: false, // process.env.NODE_ENV === 'production',
      },
    });
    return next(req, event, result);
  };
