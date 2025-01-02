import z from 'zod';

import { usernameOrEmailSchema, passwordSchema, csrfTokenSchema } from '@/app/[locale]/(common)/form/fieldSchemas';

export const loginSchema = z.object({
  username: usernameOrEmailSchema,
  password: passwordSchema,
  // csrf_token: csrfTokenSchema,
});

export type LoginFormSchema = z.infer<typeof loginSchema>;
