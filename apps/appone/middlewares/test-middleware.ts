'user server';

import { NextResponse } from 'next/server';
import { MiddlewareHandler } from '@/types/middleware-handler';

export const testMiddleware: MiddlewareHandler = async (req, res) => {
  //set cookie using res

  res?.cookies.set('test', 'test');
  res?.headers.set('test', 'test');
  console.log('test middleware');

  // Redirect to '/login' if the pathname is '/test'
  // if (req.nextUrl.pathname === '/test') {
  //   const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
  //   redirectResponse.cookies.set('redirected', 'true'); // Example of setting cookies on redirect
  //   return { response: redirectResponse, next: false };
  // }

  return { response: res!, next: true };
};
