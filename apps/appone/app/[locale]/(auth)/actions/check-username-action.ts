'use server';

import { getTranslations } from 'next-intl/server';
import { ActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createCheckUsernameSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import fetchWrapper from '@/lib/fetch-wrapper';

export async function checkUsernameAction(formData: FormData): Promise<ActionResponse> {
  const t = await getTranslations();
  const schema = createCheckUsernameSchema(t);

  try {
    const validatedData = schema.parse({
      username: formData.get('username'),
      csrf_token: formData.get('csrf_token'),
    });

    const response = await fetchWrapper(
      `${process.env.API_URL}/users/search/findByUsernameIgnoreCase?username=${validatedData.username}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, message: t('errors.validation.username_available') };
      }
      return { success: true, message: t('errors.validation.username_available') };
    }
    return { success: false, message: t('errors.validation.username_exists') };
  } catch (error: unknown) {
    return { success: true, error: t('errors.validation.error_unexpected') };
  }
}
