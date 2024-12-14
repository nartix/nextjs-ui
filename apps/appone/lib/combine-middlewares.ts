import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareResult, MiddlewareHandler } from '@/types/middleware-handler';

export function combineMiddlewares2(...middlewares: MiddlewareHandler[]) {
  return async (req: NextRequest, res: NextResponse = NextResponse.next()): Promise<NextResponse | Response> => {
    let aggregatedResponse: NextResponse | undefined;
    for (const middleware of middlewares) {
      const result: MiddlewareResult = await middleware(req, aggregatedResponse ?? NextResponse.next());
      if ((result.response instanceof NextResponse || result.response instanceof Response) && result.next === false) {
        return result.response;
      }
      if (result.response instanceof NextResponse) {
        if (!aggregatedResponse) {
          aggregatedResponse = result.response;
        }
      }
    }
    return aggregatedResponse || NextResponse.next();
  };
}
// else {
// result.response.headers.forEach((value, key) => {
//   aggregatedResponse!.headers.set(key, value);
// });
// }
export function combineMiddlewares3(...middlewares: MiddlewareHandler[]) {
  return async (req: NextRequest, res: NextResponse): Promise<NextResponse | Response> => {
    let aggregatedResponse: NextResponse | undefined;
    for (const middleware of middlewares) {
      const result: MiddlewareResult = await middleware(req, aggregatedResponse ?? res);
      if ((result.response instanceof NextResponse || result.response instanceof Response) && result.next === false) {
        return result.response;
      }
      if (result.response instanceof NextResponse) {
        if (!aggregatedResponse) {
          aggregatedResponse = result.response;
        }
      }
    }
    return aggregatedResponse || res;
  };
}

export function combineMiddlewares(...middlewares: MiddlewareHandler[]) {
  return async (req: NextRequest, res: NextResponse): Promise<NextResponse | Response> => {
    let aggregatedResponse: NextResponse = res;
    for (const middleware of middlewares) {
      const { response, next }: MiddlewareResult = await middleware(req, aggregatedResponse);
      if ((response instanceof NextResponse || response instanceof Response) && !next) {
        return response;
      }
      if (response instanceof NextResponse) {
        aggregatedResponse = response;
      }
    }
    return aggregatedResponse;
  };
}
