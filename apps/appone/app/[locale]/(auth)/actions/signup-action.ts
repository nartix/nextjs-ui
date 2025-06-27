'use server';

import { getTranslations } from 'next-intl/server';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { fetchWrapper } from '@/lib/fetch-wrapper';
import { API_URL } from '@/config/global-config';
import { handleServerActionError } from '@/lib/server-action-error-handler';

export const signupAction: ServerActionResponse = async (formData) => {
  if (!formData || typeof formData !== 'object') {
    return { success: false, message: 'Invalid form data' };
  }

  const t = await getTranslations();
  const signupSchema = createSignUpFormSchema(t);

  try {
    const validatedData = await signupSchema.parseAsync(formData);

    const response = await fetchWrapper(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return await handleServerActionError(null, {
        response,
        errorData,
        t,
      });
    }

    return { success: true };
  } catch (err: unknown) {
    return await handleServerActionError(err, { t });
  }
};
