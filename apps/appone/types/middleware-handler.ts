import { NextResponse, NextRequest } from 'next/server';

export interface MiddlewareResult {
  response: Response | NextResponse;
  next: boolean;
}

export type MiddlewareHandler = (req: NextRequest, res: NextResponse) => Promise<MiddlewareResult>;
