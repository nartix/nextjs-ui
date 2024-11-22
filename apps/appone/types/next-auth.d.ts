import NextAuth, { DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: User;
    accessToken?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
    first_name: string;
    last_name: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    user?: User;
    error?: string;
  }
}
