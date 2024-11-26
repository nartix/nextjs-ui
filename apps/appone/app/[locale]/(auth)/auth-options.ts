import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';
import { credentialsProvider } from '@/app/[locale]/(auth)/providers/credentials-provider';
import { AuthOptions, auth } from '@nartix/auth-appone';

const authOptions: Partial<AuthOptions> = {
  sessionAdaptor: ApiAdaptor({}),
  providers: [credentialsProvider],
  session: {
    maxAge: 3600,
    updateAge: 600,
  },
  cookie: {
    secure: false,
    maxAge: process.env.SESSION_COOKIE_MAXAGE ? parseInt(process.env.SESSION_COOKIE_MAXAGE, 10) : undefined,
  },
};

export const authConfig = auth(authOptions);
