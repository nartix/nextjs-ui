'use server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { signOut } from '@nartix/auth-appone';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { ActionResponse } from '@/components/common/FormBuilder';
import { FormDataValues } from '@/components/common/FormBuilder';

export interface ResponseInternal<Body extends string | Record<string, any> | any[] | null = any> {
  status?: number;
  headers?: Headers | HeadersInit;
  body?: Body;
  redirect?: string;
  // cookies?: Cookie[];
  cookies?: any;
}

export async function logoutAction(formData: FormData): Promise<void> {
  // const t = await getTranslations();

  console.log('logout action called');

  const options = await signOut(authConfig);

  // redirect(options?.redirectUrl!);
  redirect('/login');

  // if (!status) {
  //   return { success: false, message: t('auth.error_invalid_credentials') };
  // }

  // return { success: true };
}
