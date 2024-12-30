'user server';

import { NextResponse } from 'next/server';
// import { MiddlewareHandler } from '@/types/middleware-handler';
import { MiddlewareHandler } from '@nartix/next-middleware-chain';
import { isPublicPath, isLocaleSupported } from '@/lib/locale-util';
import { edgeToken } from '@nartix/edge-token/src';

export const testMiddleware: MiddlewareHandler = async (req, res) => {
  // res?.cookies.set('test', 'test');
  // res?.headers.set('test', 'test');

  console.log('test middleware run ', req.nextUrl.pathname);

  // Redirect to '/login' if the pathname is '/test'
  // if (req.nextUrl.pathname === '/test') {
  //   const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
  //   redirectResponse.cookies.set('redirected', 'true'); // Example of setting cookies on redirect
  //   return { response: redirectResponse, next: false };
  // }

  //
  // if (isPublicPath(req.nextUrl.pathname)) {
  //   console.log('public and locale path===================');
  // }

  // if (isLocaleSupported(req.nextUrl.pathname)) {
  //   console.log('supported locale===================');
  // }

  // if (res.headers.get('x-middleware-rewrite')) {
  //   console.log('x-middleware-rewrite======================', req.nextUrl.pathname);
  // }

  // const { generate: generateToken, verify: verifyToken } = await edgeToken({ secret: 'test', tokenByteLength: 0 });
  // const token = await generateToken();
  // // await new Promise((resolve) => setTimeout(resolve, 2000));
  // const isTokenValid = await verifyToken(token);
  // console.log('token ===========', token);
  // // console.log('token ===========', atob(token.split('.')[0]));
  // console.log('isTokenValid ===========', isTokenValid);

  return { response: res, next: true };
};
