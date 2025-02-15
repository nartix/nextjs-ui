'use server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { signIn, ProviderType } from '@nartix/next-security/src';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import fetchWrapper from '@/lib/fetch-wrapper';

export const signupAction: ServerActionResponse = async (formData) => {
  const t = await getTranslations();
  const signupSchema = createSignUpFormSchema(t);

  try {
    // Validate form inputs.
    const validatedData = signupSchema.parseAsync(formData);

    console.log('Signup data:', validatedData);

    // const response = await fetchWrapper('/api/auth/signup', {
    //   method: 'POST',
    //   body: JSON.stringify(validatedData),
    // });

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
  } catch (errors: unknown) {
    if (errors instanceof z.ZodError) {
      return { success: false, errors: errors.issues };
    }
    if (errors instanceof Error) {
      console.error('Signup error:', errors.message);
    } else {
      console.error('Signup error:', errors);
    }
    return { success: false, message: 'An unknown error occurred' };
  }
};
