'use server';

import { getTranslations } from 'next-intl/server';
import { signIn } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { ActionResponse } from '@/components/common/FormBuilder';
import { FormDataValues } from '@/components/common/FormBuilder';
import { loginSchema } from '@/app/[locale]/(auth)/form/login-schemas';

export async function loginAction(formData: FormDataValues): Promise<ActionResponse> {
  const t = await getTranslations();

  const { success } = loginSchema.safeParse(formData);

  if (!success) {
    return { success: false, message: t('auth.error_invalid_form_data') };
  }

  const { username, password } = formData;

  try {
    const user = await signIn(authConfig, { username, password }, 'credentials');

    if (!user) {
      return { success: false, message: t('auth.error_invalid_credentials') };
    }

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: t('errors.error_unexpected') };
  }
}
