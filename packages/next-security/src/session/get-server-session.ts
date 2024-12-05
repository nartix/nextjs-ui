import { AuthOptions } from '@nartix/next-security';

export const getServerSession = async (authOptions: AuthOptions) => {
  const { cookie, getCookie, sessionAdaptor } = authOptions;

  try {
    const sessionToken = await getCookie(cookie.name!);
    console.log('sessionToken', sessionToken);

    if (sessionToken) {
      return await sessionAdaptor.getSessionAndUser(sessionToken);
    }
  } catch (error) {
    console.error('Error getting server session:', error);
  }

  return null;
};
