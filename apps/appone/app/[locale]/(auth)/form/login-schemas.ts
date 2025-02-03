import z from 'zod';

import { usernameOrEmailSchema, passwordSchema } from '@/app/[locale]/(common)/form/fieldSchemas';

export const loginFormSchema = z.object({
  username: usernameOrEmailSchema,
  password: passwordSchema,
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
