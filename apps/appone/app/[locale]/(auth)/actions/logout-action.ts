'use server';

import { redirect } from 'next/navigation';
import { signOut } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';

export async function logoutAction(_formData: FormData): Promise<void> {
  void _formData; // Prevent unused variable warning

  const options = await signOut(authConfig);

  if (options?.redirectUrl) {
    redirect(options.redirectUrl);
  } else {
    console.error('Redirect URL is undefined');
  }
}
