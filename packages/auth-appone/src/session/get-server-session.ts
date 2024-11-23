import { AuthOptions } from '@nartix/auth-appone';

const getServerSession = async (authOptions: AuthOptions) => {
  const { sessionAdaptor } = authOptions;

  return null;
};

export default getServerSession;
