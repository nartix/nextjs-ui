import { NextRequest, NextResponse } from 'next/server';
import { edgeToken } from '@nartix/edge-token/src';

/**
 * Types
 */
interface CookieOptions {
  name?: string;
  path?: string;
  domain?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CsrfOptions {
  secret?: string;
  algorithm?: AlgorithmIdentifier;
  tokenByteLength?: number;
  headerName?: string;
  formFieldName?: string;
  cookie: CookieOptions;
  excludeMethods?: string[];
}

/**
 * Default CSRF options
 */
const DEFAULT_OPTIONS: CsrfOptions = {
  headerName: 'X-CSRF-TOKEN',
  formFieldName: 'csrf_token',
  excludeMethods: ['GET', 'HEAD', 'OPTIONS'],
  cookie: {
    name: 'CSRF-TOKEN',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    domain: undefined,
  },
};

/**
 * Checks if the request method is one that typically modifies state.
 */
export const isWriteMethod = (method: string): boolean => {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
};

/**
 * Determines if the request is a Next.js Server Action by looking for a `next-action` header.
 */
export const isServerAction = (req: NextRequest): boolean => {
  return req.headers.has('next-action');
};

/**
 * Safely parse a request's body as JSON. Returns null if parsing fails.
 */
async function parseRequestBodyAsJson<T>(req: NextRequest): Promise<T | null> {
  try {
    const text = await req.text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Error parsing JSON data for CSRF:', error);
    return null;
  }
}

/**
 * Extracts the CSRF token from multipart/form-data or x-www-form-urlencoded.
 * Handles both regular forms and server action forms (with possible field suffix).
 */
export const extractCsrfTokenFromForm = async (req: NextRequest, formFieldName: string): Promise<string | null> => {
  try {
    const formData = await req.formData();

    // If it's a server action, the field could be suffixed, e.g., "myfield_csrf_token"
    if (isServerAction(req)) {
      const serverActionToken =
        Array.from(formData.entries())
          .find(([name]) => name.endsWith(`_${formFieldName}`))?.[1]
          ?.toString() || null;

      if (serverActionToken) {
        return serverActionToken;
      }
    }

    // For regular forms, just get the direct field name
    const token = formData.get(formFieldName)?.toString() || null;
    return token;
  } catch (error) {
    console.error('Error parsing form data for CSRF:', error);
    throw new Error('Invalid form data');
  }
};

/**
 * Extracts the CSRF token from JSON or plain-text JSON (like server actions).
 * Priority is given to a header if present, otherwise we parse JSON from the body.
 * Also handles arrays vs objects for server actions.
 */
export const extractCsrfTokenFromJsonOrPlainText = async (
  req: NextRequest,
  headerName: string,
  formFieldName: string
): Promise<string | null> => {
  // 1) Attempt to extract from header
  const csrfTokenFromHeader = req.headers.get(headerName);
  if (csrfTokenFromHeader) {
    return csrfTokenFromHeader;
  }

  // 2) Parse the body as JSON
  const data = await parseRequestBodyAsJson<any>(req);
  if (!data) {
    return null;
  }

  // 3) Check if it's an array or an object
  if (Array.isArray(data) && data.length > 0 && data[0][formFieldName]) {
    return data[0][formFieldName];
  } else if (data[formFieldName]) {
    return data[formFieldName];
  }

  return null;
};

/**
 * Merges user-provided CSRF options with the defaults.
 */
export const mergeOptions = (options: Partial<CsrfOptions>, userOptions: Partial<CsrfOptions>): CsrfOptions => {
  return {
    ...options,
    ...userOptions,
    cookie: {
      ...options.cookie,
      ...userOptions.cookie,
    },
  };
};

/**
 * Constructs a 403 response when CSRF validation fails.
 */
export const invalidCsrfResponse = (
  message = 'Forbidden: CSRF token validation failed. Please refresh the page and try again.'
): NextResponse => {
  return new NextResponse(JSON.stringify({ error: message }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Helper to set a cookie on the NextResponse.
 */
function setCookie(res: NextResponse, cookieName: string, value: string, cookieOptions: CookieOptions) {
  res.cookies.set(cookieName, value, {
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    domain: cookieOptions.domain,
  });
}

/**
 * Helper to validate the CSRF token from the request against the cookie value and do a cryptographic check.
 */
async function validateCsrf(
  csrfCookieValue: string | undefined,
  csrfTokenFromRequest: string | null,
  csrf: any
): Promise<boolean> {
  if (!csrfCookieValue) {
    return false;
  }
  if (!csrfTokenFromRequest || csrfTokenFromRequest !== csrfCookieValue) {
    return false;
  }
  return !!(await csrf.verify(csrfTokenFromRequest));
}

/**
 * Retrieves the CSRF token from the request by delegating to the correct extractor based on content type.
 */
export const getTokenFromRequest = async (req: NextRequest, options: CsrfOptions): Promise<string | null> => {
  if (!isWriteMethod(req.method)) {
    // If it's not a write method, we don't need to extract a token
    return null;
  }

  const contentType = (req.headers.get('content-type') || '').toLowerCase();
  const { formFieldName, headerName } = options;

  // 1) If it's form data
  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    return extractCsrfTokenFromForm(req, formFieldName!);
  }

  // 2) If it's JSON or we detect a server action (usually plain text containing JSON)
  if (contentType.includes('application/json') || contentType.includes('application/ld+json') || isServerAction(req)) {
    return extractCsrfTokenFromJsonOrPlainText(req, headerName!, formFieldName!);
  }

  // Default to no token if it's another content type
  return null;
};

/**
 * Creates a CSRF middleware for Next.js.
 *
 * 1) Merges user options with defaults.
 * 2) Ensures we have a secret for generating tokens.
 * 3) If we have no CSRF cookie, generate one and set it on the response.
 * 4) Attempt to extract a CSRF token from the request.
 * 5) If present, validate it. If invalid, respond with 403. Otherwise, allow.
 */
const createNextCsrfMiddleware = async (req: NextRequest, res: NextResponse, options: CsrfOptions): Promise<NextResponse> => {
  const mergedOptions = mergeOptions(DEFAULT_OPTIONS, options);

  if (!mergedOptions.secret) {
    throw new Error('CSRF middleware requires a secret');
  }

  try {
    const csrf = await edgeToken(mergedOptions);
    const { headerName, cookie, excludeMethods = [] } = mergedOptions;
    const csrfCookie = req.cookies.get(cookie.name!);

    // If the cookie does not exist, generate a new CSRF token and set it
    if (!csrfCookie) {
      const token = await csrf.generate();
      setCookie(res, cookie.name!, token, cookie);
    } else {
      // If the cookie exists, attach its value to the response header
      res.headers.set(headerName!, csrfCookie.value);
    }

    // If the method is excluded, skip CSRF validation
    if (excludeMethods.includes(req.method)) {
      return res;
    }

    // Now retrieve the CSRF token from the request
    const csrfTokenFromRequest = await getTokenFromRequest(req, mergedOptions);

    // If it's a write or server action scenario, we should validate the token
    if (isServerAction(req) || csrfTokenFromRequest || isWriteMethod(req.method)) {
      const csrfCookieValue = csrfCookie?.value;
      const isValid = await validateCsrf(csrfCookieValue, csrfTokenFromRequest, csrf);

      if (!isValid) {
        return invalidCsrfResponse();
      }
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  return res;
};

export { createNextCsrfMiddleware };
