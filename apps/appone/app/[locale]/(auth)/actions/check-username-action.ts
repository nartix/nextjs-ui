'use server';

import { getTranslations } from 'next-intl/server';
import { ServerActionResponse } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { createCheckUsernameSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { fetchWrapper } from '@/lib/fetch-wrapper';
import { API_URL } from '@/app/[locale]/(common)/config/global-config';

export const checkUsernameAction: ServerActionResponse = async (formData) => {
  const t = await getTranslations();
  const schema: ReturnType<typeof createCheckUsernameSchema> = createCheckUsernameSchema(t);

  try {
    const fd = formData as FormData;
    const { username } = schema.parse({
      username: fd.get('username'),
      csrf_token: fd.get('csrf_token'),
    });

    const query = new URLSearchParams({ username });
    const url = `${API_URL}/users/search/findByUsernameIgnoreCase?${query.toString()}`;

    const response = await fetchWrapper(url, { method: 'GET' });
    if (response.ok) {
      return { success: false, message: t('errors.validation.username_exists') };
    } else if (response.status === 404) {
      return { success: true, message: t('errors.validation.username_available') };
    } else {
      return { success: false, error: t('errors.error_unexpected') };
    }
  } catch  {
    return { success: false, error: t('errors.error_unexpected') };
  }
};
