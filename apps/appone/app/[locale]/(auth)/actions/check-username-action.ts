'use server';

import { getTranslations } from 'next-intl/server';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createCheckUsernameSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { fetchWrapper } from '@/lib/fetch-wrapper';
import { API_URL } from '@/config/server-config';
import { handleServerActionError } from '@/lib/server-action-error-handler';

export const checkUsernameAction: ServerActionResponse = async (formData) => {
  if (!formData || typeof formData !== 'object') {
    return { success: false, message: 'Invalid form data' };
  }

  const t = await getTranslations();
  const schema = createCheckUsernameSchema(t);

  try {
    const validatedData = await schema.parseAsync(Object.fromEntries((formData as FormData).entries()));

    const response = await fetchWrapper(`${API_URL}/auth/check-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Username not found in the system, so it's available (treat as success)
        return { success: true, message: t('errors.validation.username_available') };
      }
      // Centralized error handler: will parse validation errors, bad request, etc.
      const errorData = await response.json();
      return await handleServerActionError(null, { response, errorData, t });
    }

    // Only runs if response.status === 200 (username exists)
    const data = await response.json();
    if (typeof data.available !== 'boolean') {
      return { success: false, message: t('errors.error_unexpected') };
    }
    return { success: false, message: t('errors.validation.username_exists') };
  } catch (err: unknown) {
    // Handles schema parsing errors and other exceptions
    return await handleServerActionError(err, { t });
  }
};
