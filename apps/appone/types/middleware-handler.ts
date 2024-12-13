// types/middleware-result.ts
import { NextResponse, NextRequest } from 'next/server';

export interface MiddlewareResult {
  response?: NextResponse | Response;
  next?: boolean; // Defaults to true if undefined
}

export type MiddlewareHandler = (req: NextRequest, res?: NextResponse) => Promise<MiddlewareResult>;
