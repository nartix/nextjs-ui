import z from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters long');

type Translator = (key: string) => string;

export const usernameOrEmailSchema = z
  .string()
  .min(4, 'Username must be at least 3 characters long.')
  .or(z.string().email('Invalid email address'));

export const createSchemas = (t: Translator): { [key: string]: z.ZodTypeAny } => ({
  emailSchema: z.string().email(t('validation.email_invalid')),
  passwordSchema: z.string().min(6, t('validation.password_length').replace('zmin', '6')),
  usernameSchema: z.string().min(3, t('validation.username_length').replace('zmin', '3')),
  usernameOrEmailSchema: z
    .string()
    .min(4, t('validation.username_length'))
    .or(z.string().email(t('validation.email_invalid'))),
});

export const createSignUpFormSchema = (t: Translator) => {
  return z
    .object({
      username: z.string().min(3, t('validation.username_length').replace('zmin', '3')),
      email: z.string().email(t('validation.email_invalid')),
      password: z.string().min(6, t('validation.password_length').replace('zmin', '6')),
      password2: z.string(),
      csrf_token: z.string(),
    })
    .refine((data) => data.password === data.password2, { message: t('validation.password_mismatch'), path: ['password2'] });
};
