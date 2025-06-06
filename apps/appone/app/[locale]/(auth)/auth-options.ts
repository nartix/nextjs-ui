import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';
import { credentialsProvider } from '@/app/[locale]/(auth)/providers/credentials-provider';
import { AuthOptions, auth } from '@nartix/next-security';

const authOptions: Partial<AuthOptions> = {
  sessionAdaptor: ApiAdaptor(),
  secret: process.env.NEXT_SECURITY_SECRET,
  providers: [credentialsProvider],
  cookie: {
    secure: false, //process.env.NODE_ENV === 'production', // enable this in production
    maxAge: process.env.SESSION_COOKIE_MAXAGE ? parseInt(process.env.SESSION_COOKIE_MAXAGE, 10) : 0,
  },
};

export const authConfig = auth(authOptions);
