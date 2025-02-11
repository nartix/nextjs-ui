'use server';

import { getTranslations } from 'next-intl/server';
import { ActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createCheckUsernameSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import fetchWrapper from '@/lib/fetch-wrapper';

export async function checkUsernameAction(formData: FormData): Promise<ActionResponse> {
  const t = await getTranslations();
  const schema = createCheckUsernameSchema(t);

  try {
    const { username } = schema.parse({
      username: formData.get('username'),
      csrf_token: formData.get('csrf_token'),
    });

    const query = new URLSearchParams({ username });
    const url = `${process.env.API_URL}/users/search/findByUsernameIgnoreCase?${query.toString()}`;

    const response = await fetchWrapper(url, { method: 'GET' });

    if (response.ok) {
      return { success: false, message: t('errors.validation.username_exists') };
    } else if (response.status === 404) {
      return { success: true, message: t('errors.validation.username_available') };
    } else {
      return { success: false, error: t('errors.validation.error_unexpected') };
    }
  } catch (error: unknown) {
    return { success: false, error: t('errors.validation.error_unexpected') };
  }
}
