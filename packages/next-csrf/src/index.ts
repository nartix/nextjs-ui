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
  cookieName?: string;
  headerName?: string;
  formFieldName?: string;
  cookie: CookieOptions;
}

/**
 * Default CSRF options
 */
const DEFAULT_OPTIONS: CsrfOptions = {
  headerName: 'X-CSRF-TOKEN',
  formFieldName: 'csrf_token',
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
 * Extracts the CSRF token from multipart/form-data or x-www-form-urlencoded.
 * Handles both regular forms and server action forms.
 */
export const extractCsrfTokenFromForm = async (req: NextRequest, formFieldName: string): Promise<string | null> => {
  try {
    const formData = await req.formData();

    // For server actions, the form field name might be suffixed (e.g., "myfield_csrf_token")
    if (isServerAction(req)) {
      const serverActionToken =
        Array.from(formData.entries())
          .find(([name]) => name.endsWith(`_${formFieldName}`))?.[1]
          ?.toString() || null;

      if (serverActionToken) {
        console.log('CSRF token (server action, from form):', serverActionToken);
        return serverActionToken;
      }
    }

    // For regular forms, just get the direct field name
    const token = formData.get(formFieldName)?.toString() || null;
    console.log('CSRF token (regular form):', token);
    return token;
  } catch (error) {
    console.error('Error parsing form data for CSRF:', error);
    throw new Error('Invalid form data');
  }
};

/**
 * Extracts the CSRF token from a JSON or JSON-LD payload.
 * Priority is given to a header if present. Otherwise, attempts to read from the JSON body.
 */
export const extractCsrfTokenFromJson = async (
  req: NextRequest,
  headerName: string,
  formFieldName: string
): Promise<string | null> => {
  try {
    // Attempt to extract CSRF token from headers first
    const csrfTokenFromHeader = req.headers.get(headerName);
    if (csrfTokenFromHeader) {
      return csrfTokenFromHeader;
    }

    // If not found in headers, attempt to extract from JSON body
    const body = await req.json();
    if (body && typeof body === 'object') {
      const csrfTokenFromBody = body[formFieldName];
      return csrfTokenFromBody ? csrfTokenFromBody.toString() : null;
    }

    return null;
  } catch (error) {
    console.error('Error parsing JSON data for CSRF:', error);
    throw new Error('Invalid JSON data');
  }
};

/**
 * Extracts the CSRF token from a Next.js Server Action when the body is plain text.
 * We try to parse the text as JSON (it can be an array or an object).
 */
export const extractCsrfTokenFromServerActionPlainText = async (
  req: NextRequest,
  formFieldName: string
): Promise<string | null> => {
  const text = await req.text();
  console.log('Server Action request text:', text);

  try {
    const data = JSON.parse(text);

    if (Array.isArray(data) && data.length > 0 && data[0][formFieldName]) {
      return data[0][formFieldName];
    } else if (data && data[formFieldName]) {
      return data[formFieldName];
    }
    return null;
  } catch (error) {
    console.error('Error extracting CSRF token from Server Action text:', error);
    return null;
  }
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
 * Retrieves the CSRF token from the request by delegating to the correct extractor.
 */
export const getTokenFromRequest = async (req: NextRequest, options: CsrfOptions): Promise<string | null> => {
  const { formFieldName, headerName } = options;
  const method = req.method.toUpperCase();
  const contentType = req.headers.get('content-type') || '';

  // 1) If it's a write method
  if (isWriteMethod(method)) {
    // 1a) If it's a form submission
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return extractCsrfTokenFromForm(req, formFieldName!);
    }

    // 1b) If it's JSON or JSON-LD
    if (contentType.includes('application/json') || contentType.includes('application/ld+json')) {
      return extractCsrfTokenFromJson(req, headerName!, formFieldName!);
    }

    // 1c) If it's a server action using plain text
    if (isServerAction(req)) {
      return extractCsrfTokenFromServerActionPlainText(req, formFieldName!);
    }
  }

  // If none of the above conditions matched, return null
  return null;
};

/**
 * Creates a CSRF middleware for Next.js.
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
    const { headerName, cookie } = mergedOptions;
    const csrfCookie = req.cookies.get(cookie.name!);

    // If the cookie does not exist, generate a new CSRF token and set it
    if (!csrfCookie) {
      const token = await csrf.generate();
      res.cookies.set(cookie.name!, token, {
        path: cookie.path,
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly!,
        secure: cookie.secure!,
        sameSite: cookie.sameSite!,
        domain: cookie.domain,
      });
    } else {
      // If the cookie exists, attach its value to the response header
      res.headers.set(headerName!, csrfCookie.value);
    }

    // Now retrieve the CSRF token from the request
    const csrfTokenFromRequest = await getTokenFromRequest(req, mergedOptions);
    console.log('Extracted CSRF token from request:', csrfTokenFromRequest);

    // If it’s a write scenario or server action scenario, we should validate the token
    if (isServerAction(req) || csrfTokenFromRequest) {
      const csrfCookieValue = csrfCookie?.value;

      // If no cookie is set but the request expects a CSRF check, reject
      if (!csrfCookieValue) {
        return invalidCsrfResponse();
      }

      // Compare the token from the request with the one in cookies
      if (csrfTokenFromRequest !== csrfCookieValue) {
        return invalidCsrfResponse();
      }

      // Final verification
      const isValid = await csrf.verify(csrfTokenFromRequest);
      if (isValid) {
        return res;
      }

      console.log('Invalid CSRF token');
      return invalidCsrfResponse();
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
    // You might choose to return a 500 or handle differently
    // return new NextResponse('Internal Server Error', { status: 500 });
  }

  // If it’s not a write scenario, just return the original response
  return res;
};

export { createNextCsrfMiddleware };
