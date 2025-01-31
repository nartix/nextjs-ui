'user server';

import { NextResponse, NextFetchEvent, NextRequest } from 'next/server';
// import { MiddlewareHandler } from '@/types/middleware-handler';
import { MiddlewareHandler } from '@nartix/next-middleware-chain';
import { isPublicPath, isLocaleSupported } from '@/lib/locale-util';
import { edgeToken } from '@nartix/edge-token/src';
import { MiddlewareFactory } from '@nartix/next-middleware-chain/src';

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

  // const { generate: generateToken, verify: verifyToken } = await edgeToken({
  //   secret: 'HLSE89W3LJSFLKJSDFOSDFDFG34TGSLKJSDFLK',
  //   tokenByteLength: 18,
  // });
  // const token = await generateToken();
  // // await new Promise((resolve) => setTimeout(resolve, 2000));
  // const isTokenValid = await verifyToken('token');
  // console.log('test token ===========', token);
  // // console.log('token ===========', atob(token.split('.')[0]));
  // console.log('test isTokenValid ===========', isTokenValid);

  // // Define the base64 string and ensure it's of type string
  // const base64: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.repeat(1000) + '===';

  // // Method 1: Multiple replace calls
  // console.time('Multiple Replaces');
  // for (let i = 0; i < 1000; i++) {
  //   // Perform multiple replace operations to convert Base64 to Base64URL
  //   const base64url: string = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  // }
  // console.timeEnd('Multiple Replaces');

  // // Define a mapping object outside the loop for better performance
  // const base64urlMapping: { [key: string]: string } = {
  //   '+': '-',
  //   '/': '_',
  //   '=': '',
  // };

  // // Method 2: Single replace with mapping
  // console.time('Single Replace with Mapping');
  // for (let i = 0; i < 1000; i++) {
  //   // Perform a single replace operation using a mapping function
  //   const base64url: string = base64
  //     .replace(/[+/=]/g, (match: string): string => {
  //       return base64urlMapping[match] || '';
  //     })
  //     .replace(/=+$/, '');
  // }
  // console.timeEnd('Single Replace with Mapping');

  let response = NextResponse.next();
  response.headers.set('x-testing-middleware', 'true');

  return { response: res, next: true };
};

export const testMiddlewareFactory: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, response?: NextResponse) => {
    console.log('test middleware run ', req.nextUrl.pathname);
    return next(req, event, response);
  };
};

export const withCustomHeader: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, incomingResponse?: NextResponse) => {
    // If the chain above didn't supply a response, create a new one.
    const response = incomingResponse ?? NextResponse.next();

    // Set a custom header *before* continuing to the next middleware
    response.headers.set('X-Powered-By', 'Universal Liberator');

    // return response;

    return next(req, event, response);

    // // Call the next middleware in the chain, passing our 'response'
    // const result = await next(req, event, response);

    // // 'result' could be:
    // //   - undefined/null/void => means next returned nothing special
    // //   - a NextResponse or a native Response
    // if (!result) {
    //   // If nothing was returned, assume we should continue with 'response'
    //   return response;
    // }

    // // If the next returned a NextResponse, we could do more changes:
    // if (result instanceof NextResponse) {
    //   result.headers.set('X-Post-Processed', 'true');
    //   return result;
    // }

    // // If it's a native Response, we typically return it outright
    // return result;
  };
};

export const withCustomHeader2: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, incomingResponse?: NextResponse) => {
    // If the chain above didn't supply a response, create a new one.
    // const response = incomingResponse ?? NextResponse.next();

    // Set a custom header *before* continuing to the next middleware
    // response.headers.set('X-Powered-By2', 'Universal Liberator');

    if (incomingResponse) {
      // Set a custom header *before* continuing to the next middleware
      incomingResponse.headers.set('X-Powered-By2', 'Universal Liberator');
      // return next(req, event, incomingResponse);
    }

    return next(req, event, incomingResponse);

    // // Call the next middleware in the chain, passing our 'response'
    // const result = await next(req, event, response);

    // // 'result' could be:
    // //   - undefined/null/void => means next returned nothing special
    // //   - a NextResponse or a native Response
    // if (!result) {
    //   // If nothing was returned, assume we should continue with 'response'
    //   return response;
    // }

    // // If the next returned a NextResponse, we could do more changes:
    // if (result instanceof NextResponse) {
    //   result.headers.set('X-Post-Processed', 'true');
    //   return result;
    // }

    // // If it's a native Response, we typically return it outright
    // return result;
  };
};
