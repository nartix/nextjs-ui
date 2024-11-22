import z from 'zod';

import { usernameOrEmailSchema, passwordSchema } from '@/app/(common)/form/fieldSchemas';

export const loginSchema = z.object({
  username: usernameOrEmailSchema,
  password: passwordSchema,
});

export type LoginFormSchema = z.infer<typeof loginSchema>;
