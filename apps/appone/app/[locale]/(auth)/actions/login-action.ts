'use server';

import { z } from 'zod';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { signIn } from '@nartix/next-security';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { loginSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { ActionResponse } from '@/app/[locale]/(common)/types/common-types';

type LoginFormValues = z.infer<typeof loginFormSchema>;

export async function loginAction(formData: LoginFormValues): Promise<ActionResponse> {
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
