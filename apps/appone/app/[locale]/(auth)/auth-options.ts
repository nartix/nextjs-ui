import ApiAdaptor from '@/app/(auth)/adaptor/api-adaptor';
import { credentialsProvider } from '@/app/(auth)/providers/credentials-provider';

const authOptions = {
  sessionAdaptor: ApiAdaptor,
  providers: [credentialsProvider],
  session: {
    maxAge: 3600,
    updateAge: 600,
  },
};
