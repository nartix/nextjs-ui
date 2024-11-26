import { cookies } from 'next/headers';
import merge from 'lodash.merge';

import { SessionAdaptor, Provider, authenticateWithProvider } from '@nartix/auth-appone';

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  maxAge: number;
}

export async function setCookie(token: string, cookieStore: ReturnType<typeof cookies>, options: Partial<CookieOptions> = {}) {
  // Set the cookie value to the base64 encoded token
  options.value = btoa(token);

  const store = await cookieStore;
  store.set(options as CookieOptions);
}

export interface AuthOptions {
  providers: Provider[];
  sessionAdaptor: SessionAdaptor;
  session: {
    sessionId?: string; // Session ID field name
    maxAge?: number;
    updateAge?: number;
  };
  cookie?: Partial<CookieOptions>;
  setCookie?: (token: string, cookieStore: ReturnType<typeof cookies>, options?: Partial<CookieOptions>) => Promise<void>; // Method to set auth token cookie
  authenticateWithProvider: typeof authenticateWithProvider;
}

export function auth(userOptions: Partial<AuthOptions>): AuthOptions {
  const defaultOptions: AuthOptions = {
    providers: [],
    sessionAdaptor: {} as SessionAdaptor,
    session: {
      sessionId: 'sessionId',
      maxAge: 3600, // Default session max age to 1 hour
      updateAge: 600, // Default update age to 10 minutes
    },
    cookie: {
      name: 'SESSION', // Default cookie name
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 86400, // Default to 24 hours
    },
    setCookie: setCookie,
    authenticateWithProvider: authenticateWithProvider,
  };

  // Merge user options with defaults
  const mergedOptions = merge({}, defaultOptions, userOptions);

  // Validate required fields
  if (!mergedOptions.providers || mergedOptions.providers.length === 0) {
    throw new Error("At least one provider must be specified in 'AuthOptions'.");
  }

  if (!mergedOptions.sessionAdaptor || typeof mergedOptions.sessionAdaptor !== 'object') {
    throw new Error("'sessionAdaptor' must be provided and must be an object.");
  }

  return mergedOptions as Required<AuthOptions>;
}
