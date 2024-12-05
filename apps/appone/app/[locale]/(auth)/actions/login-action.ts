'use server';

import { getTranslations } from 'next-intl/server';
import { signIn } from '@nartix/next-security';

import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { ActionResponse } from '@/components/common/FormBuilder';
import { FormDataValues } from '@/components/common/FormBuilder';

export async function loginAction(formData: FormDataValues): Promise<ActionResponse> {
  const t = await getTranslations();

  const user = await signIn(authConfig, { username: formData.username, password: formData.password }, 'credentials');

  if (!user) {
    return { success: false, message: t('auth.error_invalid_credentials') };
  }

  return { success: true };
}
