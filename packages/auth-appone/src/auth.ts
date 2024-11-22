import { cookies } from 'next/headers';
import { SessionAdaptor, Provider } from '@nartix/auth-appone';

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
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
    maxAge: number;
  };
}
