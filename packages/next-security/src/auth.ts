import 'server-only';
import { cookies } from 'next/headers';
import deepmerge from 'deepmerge';
import { generateToken, verifyToken, getHmacKey } from '@nartix/csrf-core';

import { SessionAdaptor, Provider, authenticateWithProvider } from '@nartix/next-security';

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  maxAge: number;
}

export async function setCookie(payload: string, options: Partial<CookieOptions> = {}): Promise<void> {
  // Set the cookie value to the base64 encoded token
  options.value = btoa(payload);
  const store = await cookies();
  store.set(options as CookieOptions);
}

export async function getCookie(name: string): Promise<string | null> {
  const store = await cookies();
  const cookie = store.get(name);
  return cookie ? cookie.value : null;
}

export interface AuthOptions {
  secret?: string;
  providers: Provider[];
  sessionAdaptor: SessionAdaptor;
  session: {
    sessionId?: string; // Session ID field name
    maxAge?: number;
    updateAge?: number;
  };
  signOutOptions?: {
    redirectUrl?: string;
  };
  cookie: Partial<CookieOptions>;
  // setCookie?: (token: string, options?: Partial<CookieOptions>) => Promise<void>;
  setCookie: typeof setCookie;
  getCookie: typeof getCookie;
  authenticateWithProvider: typeof authenticateWithProvider;
  csrf: {
    cookieName?: string;
    headerName?: string;
    algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
    tokenByteLength?: number;
    getKeyFromSecret: typeof getHmacKey;
    generateToken: typeof generateToken;
    verifyToken: typeof verifyToken;
  };
}

export function auth(userOptions: Partial<AuthOptions>): AuthOptions {
  const defaultOptions: AuthOptions = {
    signOutOptions: {
      redirectUrl: '/',
    },
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
    getCookie: getCookie,
    authenticateWithProvider: authenticateWithProvider,
    csrf: {
      algorithm: 'SHA-256',
      cookieName: 'CSRF-TOKEN',
      headerName: 'X-CSRF-TOKEN',
      tokenByteLength: 32,
      getKeyFromSecret: getHmacKey,
      generateToken: generateToken,
      verifyToken: verifyToken,
    },
  };

  // Check for NEXT_SECURITY_SECRET environment variable
  const secret = process.env.NEXT_SECURITY_SECRET || userOptions.secret;
  if (!secret) {
    throw new Error("A secret must be specified either in the environment variable 'NEXT_SECURITY_SECRET' or in 'AuthOptions'.");
  }

  // Merge user options with defaults
  const mergedOptions = deepmerge(defaultOptions, userOptions);

  // Set the secret in merged options
  mergedOptions.secret = secret;

  // Validate required fields
  if (!mergedOptions.providers || mergedOptions.providers.length === 0) {
    throw new Error("At least one provider must be specified in 'AuthOptions'.");
  }

  if (!mergedOptions.sessionAdaptor || typeof mergedOptions.sessionAdaptor !== 'object') {
    throw new Error("'sessionAdaptor' must be provided and must be an object.");
  }

  return mergedOptions as Required<AuthOptions>;
}
