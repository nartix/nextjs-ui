import { headers } from 'next/headers';

export const getCsrfToken = async () => {
  const headersList = await headers();
  const userAgent = headersList.get('x-custom-header');
  console.log('====================', userAgent);
};
