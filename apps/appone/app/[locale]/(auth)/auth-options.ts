import 'server-only';

import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';
import { credentialsProvider } from '@/app/[locale]/(auth)/providers/credentials-provider';
import { AuthOptions, auth } from '@nartix/next-security';

const authOptions: Partial<AuthOptions> = {
  sessionAdaptor: ApiAdaptor(),
  secret: process.env.NEXT_SECURITY_SECRET,
  providers: [credentialsProvider],
  cookie: {
    secure: process.env.PRODUCTION === 'true',
    maxAge: process.env.SESSION_COOKIE_MAXAGE ? parseInt(process.env.SESSION_COOKIE_MAXAGE, 10) : 0,
  },
  signOutOptions: {
    redirectUrl: '/about',
  },
};

export const authConfig = auth(authOptions);
