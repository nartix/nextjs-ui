import z from 'zod';

import { createSchemas } from '@/app/[locale]/(common)/form/fieldSchemas';
import { getTranslations } from 'next-intl/server';

const t = await getTranslations();

const { emailSchema, passwordSchema, usernameSchema, usernameOrEmailSchema } = createSchemas(t);

export const loginFormSchema = z.object({
  username: usernameOrEmailSchema,
  password: passwordSchema,
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
