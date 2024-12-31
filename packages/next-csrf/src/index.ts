import { NextRequest, NextResponse } from 'next/server';
import { edgeToken } from '@nartix/edge-token/src';

interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CsrfOptions extends CookieOptions {
  secret: string;
  algorithm?: AlgorithmIdentifier;
  tokenByteLength?: number;
  cookieName?: string;
  headerName?: string;
  formFieldName?: string;
}

const DEFAULT_OPTIONS: Partial<CsrfOptions> = {
  cookieName: 'CSRF-TOKEN',
  headerName: 'X-CSRF-TOKEN',
  formFieldName: 'csrf_token',
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  domain: undefined,
};

/**
 * Determines if the request is a Server Action.
 *
 * @param req - The incoming NextRequest object.
 * @returns A boolean indicating if the request is a Server Action.
 */
const isServerAction = (req: NextRequest): boolean => {
  return req.headers.has('next-action');
};

/**
 * Extracts the CSRF token from the request if present.
 *
 * Supports:
 * - Form submissions (`application/x-www-form-urlencoded`, `multipart/form-data`)
 * - JSON payloads (`application/json`, `application/ld+json`)
 * - Server Actions via headers or payload
 *
 * @param req - The incoming NextRequest object.
 * @param options - The CSRF configuration options.
 * @returns The CSRF token string if present; otherwise, null.
 */
const getTokenFromRequest = async (req: NextRequest, options: CsrfOptions): Promise<string | null> => {
  const { formFieldName, headerName } = options;
  const method = req.method.toUpperCase();
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const contentType = req.headers.get('content-type') || '';

  // Determine if the request is a form submission
  const isFormSubmission =
    isWriteMethod && (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data'));

  // Handle form submissions
  if (isFormSubmission) {
    try {
      const formData = await req.formData();
      const csrfToken = formData.get(formFieldName!);
      return csrfToken ? csrfToken.toString() : null;
    } catch (error) {
      console.error('Error parsing form data for CSRF:', error);
      throw new Error('Invalid form data');
    }
  }

  // Determine if the request is a JSON or JSON-LD payload
  const isJson = isWriteMethod && (contentType.includes('application/json') || contentType.includes('application/ld+json'));

  // Handle JSON and JSON-LD payloads
  if (isJson) {
    try {
      // Attempt to extract CSRF token from headers first
      const csrfTokenFromHeader = req.headers.get(headerName!);
      if (csrfTokenFromHeader) {
        return csrfTokenFromHeader;
      }

      // If not found in headers, attempt to extract from JSON body
      const body = await req.json();
      if (body && typeof body === 'object') {
        const csrfTokenFromBody = body[formFieldName!];
        return csrfTokenFromBody ? csrfTokenFromBody.toString() : null;
      }

      return null;
    } catch (error) {
      console.error('Error parsing JSON data for CSRF:', error);
      throw new Error('Invalid JSON data');
    }
  }

  // Detect if the request is a Server Action
  const serverAction = isServerAction(req);

  // Handle Server Actions
  if (serverAction) {
    const text = await req.text();
    console.log('text', text);
    try {
      const csrfTokenFromHeader = req.headers.get(headerName!);
      if (csrfTokenFromHeader) {
        return csrfTokenFromHeader;
      }

      // 2) Try parsing the plain text as JSON for a "csrf_token" field
      const data = JSON.parse(text);

      // // If you expect an array of objects
      if (Array.isArray(data) && data.length > 0 && data[0][options.formFieldName!]) {
        return data[0][options.formFieldName!];
      }
      // Otherwise, if it's just a single object
      else if (data && data[options.formFieldName!]) {
        return data[options.formFieldName!];
      }

      return null;
    } catch (error) {
      console.error('Error extracting CSRF token for Server Action:', error);
      throw new Error('Invalid Server Action request');
    }
  }

  // For other content types or methods, return null (no CSRF token)
  return null;
};

const createNextCsrfMiddleware = async (req: NextRequest, res: NextResponse, options: CsrfOptions): Promise<NextResponse> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  if (!mergedOptions.secret) {
    throw new Error('CSRF middleware requires a secret');
  }

  try {
    const csrf = await edgeToken(mergedOptions);
    const { cookieName, headerName } = mergedOptions;
    const csrfCookie = req.cookies.get(cookieName!);

    if (!csrfCookie) {
      const token = await csrf.generate();

      res.cookies.set(cookieName!, token, {
        path: mergedOptions.path,
        maxAge: mergedOptions.maxAge,
        httpOnly: mergedOptions.httpOnly!,
        secure: mergedOptions.secure!,
        sameSite: mergedOptions.sameSite!,
        domain: mergedOptions.domain,
      });
    } else {
      res.headers.set(headerName!, csrfCookie.value);
    }

    // Retrieve the CSRF token from the request using the helper function
    const csrfTokenFromRequest = await getTokenFromRequest(req, mergedOptions);
    console.log('csrfTokenFromRequest', csrfTokenFromRequest);

    if (csrfTokenFromRequest) {
      // const csrfCookieValue = csrfCookie?.value;
      // // If CSRF token is present in form but missing in cookies, reject the request
      // if (!csrfCookieValue) {
      //   return new NextResponse('CSRF token missing in cookies', { status: 403 });
      // }
      // Validate the CSRF token from the form against the cookie
      // const isValid = await csrf.verify(csrfTokenFromRequest, csrfCookieValue);
      // if (!isValid) {
      //   return new NextResponse('Invalid CSRF token', { status: 403 });
      // }
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
    // Optionally, an error response can be returned
    // return new NextResponse('Internal Server Error', { status: 500 });
  }

  return res;
};

export { createNextCsrfMiddleware };
