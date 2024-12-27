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

  // edge token tests
  // const csrt = await edgeToken({ secret: 'test', algorithm: 'SHA-1' });
  // const token = await csrt.generateWithData('test');
  // const [data, ...rest] = token.split('.');
  // console.log('data decoded edge runtime token ===========', Buffer.from(data, 'base64').toString());
  // console.log('token ===========', token);
  // // wait for 5 seconds
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // console.log('verify token ===========', await csrt.verifyWithData(token, 'test'));

  // const { generateWithDataTimed: generateToken, verifyWithDataTimed: verifyToken } = await edgeToken({ secret: 'test' });
  // const token = await generateToken('test;ldlkslefl');
  // // await new Promise((resolve) => setTimeout(resolve, 2000));
  // const isTokenValid = await verifyToken(token, 'test;ldlkslefl', 1000);
  // console.log('token ===========', token);
  // console.log('isTokenValid ===========', isTokenValid);

  return { response: res, next: true };
};
