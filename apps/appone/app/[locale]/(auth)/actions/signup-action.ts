'use server';

import { z, ZodIssue, ZodIssueCode } from 'zod';
import { getTranslations } from 'next-intl/server';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { fetchWrapper } from '@/lib/fetch-wrapper';
// import { checkUsernameAction } from '@/app/[locale]/(auth)/actions/check-username-action';
import { API_URL } from '@/config/global-config';

export const signupAction: ServerActionResponse = async (formData) => {
  const t = await getTranslations();
  const signupSchema = createSignUpFormSchema(t);

  try {
    const validatedData = await signupSchema.parseAsync(formData);

    console.log('Signup data:', validatedData);

    // const usernameCheckData = new FormData();
    // usernameCheckData.append('username', validatedData.username);
    // usernameCheckData.append('csrf_token', validatedData.csrf_token);
    // const usernameCheck = await checkUsernameAction(usernameCheckData);
    // if (!usernameCheck.success) {
    //   return {
    //     success: false,
    //     errors: [
    //       {
    //         path: ['username'],
    //         message: usernameCheck.message ?? usernameCheck.error ?? t('errors.error_unexpected'),
    //         code: 'custom',
    //       },
    //     ],
    //   };
    // }

    const response = await fetchWrapper(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // handle validation failures from the API
      if (response.status === 400 && errorData.errorCode === 'VALIDATION_FAILED') {
        const issues: ZodIssue[] = (
          errorData.errors as Array<{
            field: string;
            message: string;
          }>
        ).map((err) => ({
          code: ZodIssueCode.custom,
          path: [err.field],
          message: err.message,
        }));
        return { success: false, errors: issues };
      }
      // fallback for other errors
      return {
        success: false,
        message: errorData.detail || t('errors.error_unexpected'),
      };
    }

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return { success: false, message: errorData.detail || t('errors.error_unexpected') };
    // }

    // TODO: api Registration

    // await signIn(
    //   authConfig,
    //   {
    //     username: validatedData.username,
    //     password: validatedData.password,
    //   },
    //   'credentials'
    // );

    return { success: true };
  } catch (errors: unknown) {
    if (errors instanceof z.ZodError) {
      return { success: false, errors: errors.issues };
    }
    // if (errors instanceof Error) {
    //   console.error('Signup error:', errors.message);
    // } else {
    //   console.error('Signup error:', errors);
    // }
    return { success: false, message: t('errors.error_unexpected') };
  }
};
