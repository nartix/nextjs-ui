'user server';

import { NextRequest } from 'next/server';

/**
 * Logger Middleware
 * Logs the incoming request URL.
 */
export function logger(req: NextRequest): void {
  console.log(`Request URL: ${req.url}`);
  // No response returned; continue to the next middleware
}
