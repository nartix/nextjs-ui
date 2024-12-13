// types/middleware-result.ts
import { NextResponse, NextRequest } from 'next/server';

export interface MiddlewareResult {
  response?: NextResponse | Response;
  propagate?: boolean; // Defaults to true if undefined
}

export type CustomMiddleware = (req: NextRequest, res?: NextResponse) => Promise<MiddlewareResult>;
