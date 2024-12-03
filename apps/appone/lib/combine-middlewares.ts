import { NextRequest, NextResponse } from 'next/server';

type Middleware = (req: NextRequest) => NextResponse | Promise<NextResponse | void> | void;

/**
 * Combines multiple middleware functions into a single middleware.
 * @param middlewares - Array of middleware functions to combine.
 * @returns A composed middleware function.
 */
export function combineMiddlewares(...middlewares: Middleware[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    for (const middleware of middlewares) {
      const response = await middleware(req);
      if (response instanceof NextResponse) {
        // Middleware has decided to terminate the request
        return response;
      }
    }
    // All middleware passed; proceed to the next handler
    return NextResponse.next();
  };
}
