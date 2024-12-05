import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';
import { credentialsProvider } from '@/app/[locale]/(auth)/providers/credentials-provider';
import { AuthOptions, auth } from '@nartix/next-security';

const authOptions: Partial<AuthOptions> = {
  sessionAdaptor: ApiAdaptor({}),
  providers: [credentialsProvider],
  cookie: {
    secure: false,
    maxAge: process.env.SESSION_COOKIE_MAXAGE ? parseInt(process.env.SESSION_COOKIE_MAXAGE, 10) : undefined,
  },
};

export const authConfig = auth(authOptions);
