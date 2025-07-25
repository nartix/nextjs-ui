'use server';

import { getTranslations } from 'next-intl/server';
import { signIn } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createLoginFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';

export const loginAction: ServerActionResponse = async (formData) => {
  if (!formData || typeof formData !== 'object') {
    return { success: false, message: 'Invalid form data' };
  }

  const t = await getTranslations();
  const loginformSchemas = createLoginFormSchema(t);

  const parsedData = loginformSchemas.safeParse(formData);
  if (!parsedData.success) {
    return { success: false, message: t('auth.error_invalid_form_data') };
  }

  const { username, password } = parsedData.data;
  try {
    const user = await signIn(authConfig, { username, password }, 'credentials');

    if (!user) {
      return { success: false, message: t('auth.error_invalid_credentials') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: t('errors.error_unexpected'), errorCode: 'UNEXPECTED_ERROR' };
  }
};
