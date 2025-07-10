# @nartix/next-security

A modular authentication and security package for Next.js 15+ applications, inspired by the NextAuth.js npm package. This package was created because NextAuth.js does not support database sessions for credential logins. As a result, @nartix/next-security is built on similar concepts but provides full support for database-backed sessions with credential authentication, along with session management, provider-based authentication, and secure cookie handling.

This package can also serve as a great starter for building your own custom authentication, authorization, and security solutions tailored to your application's needs.

## Features

- Pluggable authentication providers (credentials, JWT, OAuth, etc.)
- Session management with custom session adaptor interface
- Secure cookie handling (httpOnly, sameSite, etc.)
- TypeScript support

## Usage

### 1. Configure Auth Options

```ts
import { auth, AuthOptions } from '@nartix/next-security';
import { credentialsProvider } from '@nartix/next-security/providers/credential-provider';
import { mySessionAdaptor } from './your-session-adaptor';

const authOptions: Partial<AuthOptions> = {
  secret: process.env.NEXT_SECURITY_SECRET,
  providers: [credentialsProvider],
  sessionAdaptor: mySessionAdaptor,
};

const options = auth(authOptions);
```

### 2. Sign In

```ts
import { signIn } from '@nartix/next-security';

const user = await signIn(options, { username, password }, 'credentials');
```

### 3. Sign Out

```ts
import { signOut } from '@nartix/next-security';

await signOut(options);
```

### 4. Get Server Session

```ts
import { getServerSession } from '@nartix/next-security';

const session = await getServerSession(options);
```

## Custom Providers

You can implement your own provider by following the `Provider` interface:

```ts
import { Provider } from '@nartix/next-security';

const myProvider: Provider = {
  id: 'credentials',
  async authorize(credentials) {
    // Your logic
    return userOrNull;
  },
};
```

## Session Adaptor

Implement the `SessionAdaptor` interface to connect to your session store (DB, Redis, etc.):

```ts
import { SessionAdaptor, SessionObj } from '@nartix/next-security';

export const mySessionAdaptor: SessionAdaptor = {
  async getSessionAndUser(token) {
    /* ... */
  },
  async createSession(user, expires) {
    /* ... */
  },
  async deleteSession(token) {
    /* ... */
  },
  async updateSession(session) {
    /* ... */
  },
  async getUser(id) {
    /* ... */
  },
};
```

## Middleware

Use the provided middleware for session updates:

```ts
import { nextSecurityMiddleware } from '@nartix/next-security';
```

## License

MIT
