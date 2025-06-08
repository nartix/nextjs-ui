import { cookies } from 'next/headers';

export const getCsrfToken = async () => {
  return (await cookies()).get(process.env.CSRF_COOKIE_NAME ?? '')?.value || null;
};
