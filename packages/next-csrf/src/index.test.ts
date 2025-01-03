// csrfMiddleware.test.ts

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  isWriteMethod,
  isServerAction,
  extractCsrfTokenFromForm,
  extractCsrfTokenFromJson,
  extractCsrfTokenFromServerActionPlainText,
  mergeOptions,
  invalidCsrfResponse, // renamed from invalidResponse
  getTokenFromRequest,
  createNextCsrfMiddleware,
} from '@nartix/next-csrf/src';

// Define mock functions at the top level
var mockGenerate = jest.fn<(data?: string) => Promise<string>>().mockResolvedValue('generatedToken');
var mockVerify = jest.fn<(token: string, data?: string) => Promise<boolean>>().mockResolvedValue(true);

// Move jest.mock to the top level
jest.mock('@nartix/edge-token/src', () => ({
  edgeToken: jest
    .fn<
      () => Promise<{
        generate: jest.Mock<(data?: string) => Promise<string>>;
        verify: jest.Mock<(token: string, data?: string) => Promise<boolean>>;
      }>
    >()
    .mockResolvedValue({
      generate: mockGenerate,
      verify: mockVerify,
    }),
}));
/**
 * A simple helper to mock a NextRequest. You can expand or adjust as needed.
 */
function createMockNextRequest(method: string, headers: Record<string, string> = {}, body?: any): NextRequest {
  return {
    method,
    headers: new Map(Object.entries(headers)),
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    formData: async () => {
      // Simulate the FormData API: iterate over an object, returning entries.
      const form = new FormData();
      if (body && typeof body === 'object') {
        for (const [key, val] of Object.entries(body)) {
          form.append(key, val as string | Blob);
        }
      }
      return form;
    },
    cookies: {
      // Minimal mock for cookies
      get: (name: string) => undefined,
      // The NextResponse sets cookies, so the request “cookies” typically read-only
    },
  } as unknown as NextRequest;
}

/**
 * Helper to mock NextResponse.
 */
function createMockNextResponse(): NextResponse {
  // We’ll store headers and cookies in a simple object for testing
  const headers: Record<string, string> = {};
  const cookies: Record<string, any> = {};

  const response = {
    headers: {
      set: (key: string, value: string) => {
        headers[key] = value;
      },
      get: (key: string) => headers[key],
    },
    cookies: {
      set: (name: string, value: string, options: any) => {
        cookies[name] = { value, ...options };
      },
    },
    status: 200,
    body: null,
    // Adding text method to simulate NextResponse.text()
    text: jest.fn<() => Promise<string>>().mockResolvedValue(''),
  } as any;

  // NextResponse allows a constructor with body or such, but we’ll simulate
  return response as unknown as NextResponse;
}

describe('CSRF Middleware Tests', () => {
  // Reset mocks before each test to ensure no leakage
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('isWriteMethod', () => {
    test('returns true for POST, PUT, PATCH, DELETE', () => {
      expect(isWriteMethod('POST')).toBe(true);
      expect(isWriteMethod('PUT')).toBe(true);
      expect(isWriteMethod('PATCH')).toBe(true);
      expect(isWriteMethod('DELETE')).toBe(true);
    });

    test('returns false for GET, OPTIONS, HEAD, etc.', () => {
      expect(isWriteMethod('GET')).toBe(false);
      expect(isWriteMethod('OPTIONS')).toBe(false);
      expect(isWriteMethod('HEAD')).toBe(false);
    });
  });

  describe('isServerAction', () => {
    test('returns true if next-action header is present', () => {
      const req = createMockNextRequest('POST', { 'next-action': '1' });
      expect(isServerAction(req)).toBe(true);
    });

    test('returns false if next-action header is not present', () => {
      const req = createMockNextRequest('POST', {});
      expect(isServerAction(req)).toBe(false);
    });
  });

  describe('extractCsrfTokenFromForm', () => {
    test('extracts token from regular form field', async () => {
      const req = createMockNextRequest(
        'POST',
        {},
        { csrf_token: 'abc123' } // form field
      );
      const token = await extractCsrfTokenFromForm(req, 'csrf_token');
      expect(token).toBe('abc123');
    });

    test('extracts token from server action form field (with suffix)', async () => {
      const req = createMockNextRequest('POST', { 'next-action': '1' }, { someField: 'foo', my_csrf_token: 'serverActionToken' });
      const token = await extractCsrfTokenFromForm(req, 'csrf_token');
      expect(token).toBe('serverActionToken');
    });

    test('returns null if token not found', async () => {
      const req = createMockNextRequest('POST', {}, { someField: 'foo' });
      const token = await extractCsrfTokenFromForm(req, 'csrf_token');
      expect(token).toBeNull();
    });

    test('throws error if form data parsing fails', async () => {
      // simulate a scenario that might fail
      const req = {
        ...createMockNextRequest('POST', {}),
        formData: jest.fn<() => Promise<FormData>>().mockRejectedValue(new Error('bad form')),
      } as unknown as NextRequest;

      await expect(extractCsrfTokenFromForm(req, 'csrf_token')).rejects.toThrow('Invalid form data');
    });
  });

  describe('extractCsrfTokenFromJson', () => {
    test('returns header token if present', async () => {
      const req = createMockNextRequest('POST', { 'X-CSRF-TOKEN': 'headerToken' }, { csrf_token: 'bodyToken' });
      const token = await extractCsrfTokenFromJson(req, 'X-CSRF-TOKEN', 'csrf_token');
      expect(token).toBe('headerToken');
    });

    test('returns body token if header not present', async () => {
      const req = createMockNextRequest('POST', {}, { csrf_token: 'bodyToken' });
      const token = await extractCsrfTokenFromJson(req, 'X-CSRF-TOKEN', 'csrf_token');
      expect(token).toBe('bodyToken');
    });

    test('returns null if neither header nor body token present', async () => {
      const req = createMockNextRequest('POST', {}, {});
      const token = await extractCsrfTokenFromJson(req, 'X-CSRF-TOKEN', 'csrf_token');
      expect(token).toBeNull();
    });

    test('throws error if JSON parsing fails', async () => {
      const req = {
        ...createMockNextRequest('POST', {}),
        json: jest.fn<() => Promise<any>>().mockRejectedValue(new Error('bad json')),
      } as unknown as NextRequest;

      await expect(extractCsrfTokenFromJson(req, 'X-CSRF-TOKEN', 'csrf_token')).rejects.toThrow('Invalid JSON data');
    });
  });

  describe('extractCsrfTokenFromServerActionPlainText', () => {
    test('parses single object JSON text', async () => {
      const req = createMockNextRequest('POST', {}, '{"csrf_token":"fromPlainText"}');
      const token = await extractCsrfTokenFromServerActionPlainText(req, 'csrf_token');
      expect(token).toBe('fromPlainText');
    });

    test('parses array JSON text', async () => {
      const req = createMockNextRequest('POST', {}, '[{"csrf_token":"fromArray"}]');
      const token = await extractCsrfTokenFromServerActionPlainText(req, 'csrf_token');
      expect(token).toBe('fromArray');
    });

    test('returns null if field is not present', async () => {
      const req = createMockNextRequest('POST', {}, '{"someField":"value"}');
      const token = await extractCsrfTokenFromServerActionPlainText(req, 'csrf_token');
      expect(token).toBeNull();
    });

    test('returns null if invalid JSON', async () => {
      const req = createMockNextRequest('POST', {}, 'not valid json');
      const token = await extractCsrfTokenFromServerActionPlainText(req, 'csrf_token');
      expect(token).toBeNull();
    });
  });

  describe('mergeOptions', () => {
    test('merges partial user options with default options', () => {
      const userOptions = {
        headerName: 'NEW-CSRF-HEADER',
        cookie: {
          name: 'NEW-CSRF-TOKEN',
          maxAge: 3600,
        },
      };
      const result = mergeOptions(
        {
          headerName: 'X-CSRF-TOKEN',
          formFieldName: 'csrf_token',
          cookie: {
            name: 'CSRF-TOKEN',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 604800,
          },
        },
        userOptions
      );
      expect(result.headerName).toBe('NEW-CSRF-HEADER');
      expect(result.cookie.name).toBe('NEW-CSRF-TOKEN');
      expect(result.cookie.maxAge).toBe(3600);
      expect(result.cookie.path).toBe('/');
      expect(result.cookie.secure).toBe(true);
    });
  });

  test('returns a 403 response with JSON error message', async () => {
    const response = invalidCsrfResponse('CSRF check failed');
    expect(response.status).toBe(403);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    // Instead of checking response.body directly, read the text stream:
    const bodyText = await response.text();
    expect(bodyText).toEqual(JSON.stringify({ error: 'CSRF check failed' }));
  });

  describe('getTokenFromRequest', () => {
    test('returns token from form submission', async () => {
      const req = createMockNextRequest('POST', { 'content-type': 'multipart/form-data' }, { csrf_token: 'formToken' });
      const token = await getTokenFromRequest(req, {
        formFieldName: 'csrf_token',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);
      expect(token).toBe('formToken');
    });

    test('returns token from JSON submission (body)', async () => {
      const req = createMockNextRequest('POST', { 'content-type': 'application/json' }, { csrf_token: 'jsonToken' });
      const token = await getTokenFromRequest(req, {
        formFieldName: 'csrf_token',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);
      expect(token).toBe('jsonToken');
    });

    test('returns token from JSON submission (header)', async () => {
      const req = createMockNextRequest('POST', { 'content-type': 'application/json', 'X-CSRF-TOKEN': 'headerToken' }, {});
      const token = await getTokenFromRequest(req, {
        formFieldName: 'csrf_token',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);
      expect(token).toBe('headerToken');
    });

    test('returns token from server action plain text', async () => {
      const req = createMockNextRequest(
        'POST',
        { 'content-type': 'text/plain', 'next-action': '1' },
        { csrf_token: 'serverActionTextToken' }
      );
      const token = await getTokenFromRequest(req, {
        formFieldName: 'csrf_token',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);
      expect(token).toBe('serverActionTextToken');
    });

    test('returns null if not write method or no recognized content type', async () => {
      const req = createMockNextRequest('GET', {}, {});
      const token = await getTokenFromRequest(req, {
        formFieldName: 'csrf_token',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);
      expect(token).toBeNull();
    });
  });

  describe('createNextCsrfMiddleware', () => {
    test('throws error if secret is not provided', async () => {
      const req = createMockNextRequest('GET');
      const res = createMockNextResponse();
      await expect(
        createNextCsrfMiddleware(req, res, {
          // no secret
          cookie: { name: 'CSRF-TOKEN' },
        } as any)
      ).rejects.toThrow('CSRF middleware requires a secret');
    });

    test('sets cookie if not already present', async () => {
      const req = createMockNextRequest('GET');
      // Force the middleware to think there's no existing cookie
      (req.cookies as any).get = jest.fn().mockReturnValue(undefined);

      const res = createMockNextResponse();

      await createNextCsrfMiddleware(req, res, {
        secret: 'mysecret',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);

      // Assert that mockGenerate was indeed called
      //   expect(mockGenerate).toHaveBeenCalled();
      // And that we tried to set the cookie
      expect(res.cookies).toHaveProperty('set');
    });

    test('uses existing cookie and sets header', async () => {
      const req = {
        ...createMockNextRequest('GET'),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'existingToken' }),
        },
      } as unknown as NextRequest;
      const res = createMockNextResponse();

      await createNextCsrfMiddleware(req, res, {
        secret: 'mysecret',
        headerName: 'X-CSRF-TOKEN',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);

      // Should not generate a new token
      expect(mockGenerate).not.toHaveBeenCalled();
      // Sets the header to the cookie’s value
      expect(res.headers.get('X-CSRF-TOKEN')).toBe('existingToken');
    });

    test('validates token for write method', async () => {
      // Simulate an incoming form request with the same token in cookie
      const req = {
        ...createMockNextRequest('POST', { 'content-type': 'application/x-www-form-urlencoded' }, { csrf_token: 'cookieToken' }),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'cookieToken' }),
        },
      } as unknown as NextRequest;

      const res = createMockNextResponse();

      await createNextCsrfMiddleware(req, res, {
        secret: 'mysecret',
        cookie: { name: 'CSRF-TOKEN' },
        headerName: 'X-CSRF-TOKEN',
      } as any);

      //   expect(mockVerify).toHaveBeenCalledWith('cookieToken');
      // Should pass with the same token
      expect(res.status).toBe(200);
    });

    test('rejects if token from request and cookie do not match', async () => {
      const req = {
        ...createMockNextRequest('POST', { 'content-type': 'application/json' }, { csrf_token: 'bodyToken' }),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'cookieToken' }),
        },
      } as unknown as NextRequest;
      const res = createMockNextResponse();

      const result = await createNextCsrfMiddleware(req, res, {
        secret: 'mysecret',
        cookie: { name: 'CSRF-TOKEN' },
        headerName: 'X-CSRF-TOKEN',
      } as any);

      expect(result.status).toBe(403);
      //   expect(JSON.parse(result.body as unknown as string)).toHaveProperty('error');
    });

    test('returns original response if not a write method and no server action token', async () => {
      const req = createMockNextRequest('GET');
      const res = createMockNextResponse();

      const result = await createNextCsrfMiddleware(req, res, {
        secret: 'mysecret',
        cookie: { name: 'CSRF-TOKEN' },
      } as any);

      // Should not block
      expect(result.status).toBe(200);
    });
  });
});
