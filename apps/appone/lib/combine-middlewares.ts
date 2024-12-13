// import { NextRequest, NextResponse } from 'next/server';

// type Middleware = (req: NextRequest) => NextResponse | Promise<NextResponse | void> | void;

// /**
//  * Combines multiple middleware functions into a single middleware.
//  * @param middlewares - Array of middleware functions to combine.
//  * @returns A composed middleware function.
//  */
// export function combineMiddlewares(...middlewares: Middleware[]) {
//   return async (req: NextRequest): Promise<NextResponse> => {
//     for (const middleware of middlewares) {
//       const response = await middleware(req);
//       if (response instanceof NextResponse) {
//         // Middleware has decided to terminate the request
//         return response;
//       }
//     }
//     // All middleware passed; proceed to the next handler
//     return NextResponse.next();
//   };
// }

// lib/combine-middlewares.ts
import { NextRequest, NextResponse } from 'next/server';

// type Middleware = (req: NextRequest) => Promise<NextResponse | undefined | void | Response>;

// export function combineMiddlewares(...middlewares: Middleware[]) {
//   return async (req: NextRequest): Promise<NextResponse> => {
//     let response: NextResponse | undefined = undefined;

//     for (const middleware of middlewares) {
//       const res = await middleware(req);
//       if (res) {
//         if (!response) {
//           if (res instanceof NextResponse) {
//             response = res;
//           }
//         } else {
//           // Merge headers from this middleware's response into the aggregated response
//           res.headers.forEach((value, key) => {
//             response!.headers.set(key, value);
//           });
//         }
//       }
//     }

//     return response || NextResponse.next();
//   };
// }

import { MiddlewareResult, MiddlewareHandler } from '@/types/middleware-handler';

export function combineMiddlewares(...middlewares: MiddlewareHandler[]) {
  if (middlewares.length === 0) {
    return async () => NextResponse.next();
  }
  return async (req: NextRequest, res: NextResponse = NextResponse.next()): Promise<NextResponse | Response> => {
    let aggregatedResponse: NextResponse | undefined = undefined;

    for (const middleware of middlewares) {
      const result: MiddlewareResult = await middleware(req, aggregatedResponse ?? NextResponse.next());

      if ((result.response instanceof NextResponse || result.response instanceof Response) && result.next === false) {
        return result.response;
      } else {
        if (result.response instanceof NextResponse) {
          if (!aggregatedResponse) {
            aggregatedResponse = result.response;
          } else {
            result.response.headers.forEach((value, key) => {
              aggregatedResponse!.headers.set(key, value);
            });
          }
        }
      }
    }

    return aggregatedResponse || NextResponse.next();
  };
}
