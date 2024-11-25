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
  maxAge?: number;
}

export async function setAuthTokenCookie(
  token: string,
  cookieStore: ReturnType<typeof cookies>,
  options: Partial<CookieOptions> = {}
) {
  const defaultOptions: CookieOptions = {
    name: 'SESSION',
    value: btoa(token),
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  };

  const cookieOptions = { ...defaultOptions, ...options };

  const store = await cookieStore;
  store.set(cookieOptions);
}

export interface AuthOptions {
  providers: Provider[];
  sessionAdaptor: SessionAdaptor;
  session?: {
    sessionId?: string; // Session ID field name
    maxAge?: number; // Maximum age of the session in seconds
    updateAge?: number; // Optional: Frequency (in seconds) to update the session
  };
  cookie?: Partial<CookieOptions>;
  setAuthTokenCookie?: (
    token: string,
    cookieStore: ReturnType<typeof cookies>,
    options?: Partial<CookieOptions>
  ) => Promise<void>; // Method to set auth token cookie
  authenticateWithProvider?: typeof authenticateWithProvider;
}

export async function auth(userOptions: Partial<AuthOptions>): Promise<AuthOptions> {
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
      httpOnly: true, // Default to HTTP only
      secure: true, // Default to secure
      sameSite: 'strict', // Default to lax same site policy
    },
    setAuthTokenCookie: setAuthTokenCookie,
    authenticateWithProvider: authenticateWithProvider,
  };

  // return {
  //   ...defaultOptions,
  //   ...userOptions,
  //   session: {
  //     ...defaultOptions.session,
  //     ...userOptions.session,
  //   },
  //   cookie: {
  //     ...defaultOptions.cookie,
  //     ...userOptions.cookie,
  //   },
  // };

  // Merge user options with defaults
  const mergedOptions = merge({}, defaultOptions, userOptions);

  // Validate required fields
  if (!mergedOptions.providers || mergedOptions.providers.length === 0) {
    throw new Error("At least one provider must be specified in 'AuthOptions'.");
  }

  if (!mergedOptions.sessionAdaptor || typeof mergedOptions.sessionAdaptor !== 'object') {
    throw new Error("'sessionAdaptor' must be provided and must be an object.");
  }

  return mergedOptions;
}
