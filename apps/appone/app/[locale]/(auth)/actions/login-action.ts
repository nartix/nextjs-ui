'use server';

import { ActionResponse } from '@/components/common/FormBuilder';
import { FormDataValues } from '@/components/common/FormBuilder';
import { getTranslations } from 'next-intl/server';

import { signIn } from '@nartix/auth-appone';

import { credentialsProvider } from '@/app/[locale]/(auth)/provider/credentials-provider';

import ApiAdaptor from '@/app/[locale]/(auth)/adaptor/api-adaptor';

export async function loginAction(formData: FormDataValues): Promise<ActionResponse> {
  const t = await getTranslations();

  const user = await signIn(credentialsProvider, { username: formData.username, password: formData.password }, ApiAdaptor(null));
  console.log('user', user);

  if (!user) {
    return { success: false, message: t('auth.error_invalid_credentials') };
  }

  return { success: true };
}
