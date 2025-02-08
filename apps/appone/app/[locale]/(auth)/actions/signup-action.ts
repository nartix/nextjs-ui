'use server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { signIn, ProviderType } from '@nartix/next-security/src';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { serverActionType } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';

export const signupAction: serverActionType<Record<string, unknown>> = async (formData) => {
  const t = await getTranslations('errors');
  const signupSchema = createSignUpFormSchema(t);

  try {
    // Validate form inputs.
    const validatedData = signupSchema.parse(formData);

    // TODO: api Registration

    // await signIn(
    //   authConfig,
    //   {
    //     username: validatedData.username,
    //     password: validatedData.password,
    //   },
    //   'credentials'
    // );

    return { success: true, message: 'Signup successful' };
  } catch (errors) {
    if (errors instanceof z.ZodError) {
      return { success: false, errors: errors.issues };
    }
    return { success: false, message: 'An unknown error occurred' };
  }
};
