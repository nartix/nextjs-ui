'user server';

import { MiddlewareFactory } from '@nartix/next-middleware-chain/src';
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server';

export const loggerMiddlewareFactory: MiddlewareFactory = (next) => {
  return async (req: NextRequest, event: NextFetchEvent, response?: NextResponse) => {
    if (req.headers.get('x-middleware-rewrite')) {
      console.log(`Request URL: ${req.url}`);
    }
    return next(req, event, response);
  };
};
