'use server';
import { redirect } from 'next/navigation';
import { signOut } from '@nartix/auth-appone';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';

export async function logoutAction(formData: FormData): Promise<void> {
  const options = await signOut(authConfig);

  redirect(options?.redirectUrl!);
  return;
}
