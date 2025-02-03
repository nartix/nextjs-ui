import z from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');

export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters long');

export const usernameOrEmailSchema = z
  .string()
  .min(4, 'Username must be at least 3 characters long.')
  .or(z.string().email('Invalid email address'));

export const createSchemas = (t: (key: string) => string): { [key: string]: z.ZodTypeAny } => ({
  emailSchema: z.string().email(t('email_invalid')),
  passwordSchema: z.string().min(6, t('password_length')),
  usernameSchema: z.string().min(3, t('username_length')),
  usernameOrEmailSchema: z
    .string()
    .min(4, t('username_length'))
    .or(z.string().email(t('email_invalid'))),
});
