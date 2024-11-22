// middlewares/logger.ts
import { NextRequest, NextResponse } from 'next/server';

export function logger(req: NextRequest, res: NextResponse, next: () => void) {
  console.log(`Request URL: ${req.url}`);
  next();
}

// export function auth(req: NextRequest, res: NextResponse, next: () => void) {
//   if (!req.headers.get('authorization')) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   next();
// }

// type Middleware = (req: NextRequest, res: NextResponse, next: () => void) => void;

// export function combineMiddlewares(...middlewares: Middleware[]) {
//   return (req: NextRequest, res: NextResponse, next: () => void) => {
//     const runMiddleware = (index: number) => {
//       if (index < middlewares.length) {
//         (middlewaresindex) => runMiddleware(index + 1);
//       } else {
//         next();
//       }
//     };
//     runMiddleware(0);
//   };
// }

type Middleware = (req: NextRequest, res: NextResponse, next: () => void) => void;

export function combineMiddlewares(...middlewares: Middleware[]) {
  return (req: NextRequest, res: NextResponse, next: () => void) => {
    const runMiddleware = (index: number) => {
      if (index < middlewares.length && middlewares[index]) {
        middlewares[index](req, res, () => runMiddleware(index + 1));
      } else {
        next();
      }
    };
    runMiddleware(0);
  };
}

// // middleware.ts
// import { combineMiddlewares } from './middlewares/combineMiddlewares';
// import { logger } from './middlewares/logger';
// import { auth } from './middlewares/auth';

// export function middleware(req: NextRequest, res: NextResponse, next: () => void) {
//   combineMiddlewares(logger, auth)(req, res, next);
// }
