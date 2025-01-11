# Next CSRF

A lightweight CSRF protection middleware for Next.js on the Edge Runtime. It automatically protects **write methods**—including `POST`, `PUT`, `PATCH`, and `DELETE`—by performing a **double check** on the CSRF token. It compares the token from the request body or headers with the token stored in the cookie. You can access the token via **request header** or by reading the **cookie** value.

## Installation

```bash
npm install @nartix/next-csrf
```

## Quick Start

Below is a minimal example of how to integrate this middleware in a Next.js app:

```typescript
// middleware.ts (or middleware.js)
import { NextRequest, NextResponse } from 'next/server';
import { createNextCsrfMiddleware } from '@nartix/next-csrf';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Provide any custom options here
  const csrfOptions = {
    secret: 'your-secret-key', // Required
    // Additional options can be specified
  };

  return createNextCsrfMiddleware(req, res, csrfOptions);
}
```


## Default Configuration

Below is an example of the default configuration. You can override any of these options in the middleware:

```js
// default config

{
  headerName: 'X-CSRF-TOKEN',
  formFieldName: 'csrf_token',
  excludeMethods: ['GET', 'HEAD', 'OPTIONS'],
  algorithm: 'SHA-256',
  tokenByteLength: 32,
  separator: '.',
  enableHeaderCheckForJson: false,
  cookie: {
    name: 'CSRF-TOKEN',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    domain: undefined,
  },
}
```

## How It Works

1. **Token Generation**: If the `CSRF-TOKEN` cookie does not exist, the middleware generates a new token and sets it as a cookie.
2. **Double Check**: It compares the token in the cookie to the token from the request—either via a form field, JSON body, or request header.
3. **Verification**: The token is then cryptographically validated with your secret.
4. **Optional Header Access**: You can configure `enableHeaderCheckForJson` to allow tokens to be read directly from headers for JSON requests.

## Error Handling

If token validation fails, the middleware automatically returns a **403 Forbidden** response with a JSON error message.

## License

MIT License. Feel free to modify and use in your projects.

---