'use server';

import { unknown, z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { signIn } from '@nartix/next-security/src';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createLoginFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';

export const loginAction: ServerActionResponse<Record<string, unknown> | FormData> = async (formData) => {
  // export async function loginAction(formData: LoginFormValues | Record<string, unknown>): Promise<ActionResponse> {
  // Simulate a server call. We'll reject if username or password is wrong

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     if (data.username === 'user' && data.password === 'password') {
  //       resolve({ success: true }); // success
  //     } else {
  //       resolve({
  //         success: false,
  //         message: 'Username or password is incorrect',
  //       });
  //     }
  //   }, 1000);
  // });

  // redirect('/en');

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
    console.error('Login error:', error);
    return { success: false, message: t('errors.error_unexpected'), errorCode: 'UNEXPECTED_ERROR' };
  }
};
