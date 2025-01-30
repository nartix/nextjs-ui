'use server';

import { redirect } from 'next/navigation';
import { signOut } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { headers } from 'next/headers';

export async function logoutAction(formData: FormData): Promise<void> {
  const requestHeaders = await headers();
  const headersObj: Record<string, string> = Object.fromEntries(requestHeaders);
  console.log('headersObj', headersObj);
  console.log('formData', formData);

  const options = await signOut(authConfig);

  if (options?.redirectUrl) {
    redirect(options.redirectUrl);
  } else {
    console.error('Redirect URL is undefined');
  }
}
