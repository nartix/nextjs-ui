import { setCookie, ProviderType } from '@nartix/auth-appone';
import { AuthOptions } from '@nartix/auth-appone';

// cookies can only be set in server action or page handlers in Next.js
export async function signOut(authOptions: AuthOptions) {
  const { sessionAdaptor, cookie, getCookie, signOutOptions } = authOptions;

  const sessionToken = await getCookie(cookie.name!);

  if (!sessionToken) {
    return signOutOptions;
  }

  // Delete the session from the database
  try {
    await sessionAdaptor.deleteSession(atob(sessionToken));
  } catch (error) {
    console.error('Error deleting session:', error);
  }

  // Clear the cookie by setting its value to an empty string and a past expiry date
  await setCookie('', {
    ...cookie,
    value: '',
    maxAge: 0, // Expire immediately
  });

  console.log('User signed out successfully.');
  return signOutOptions;
}
