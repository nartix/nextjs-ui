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

export const createSignUpFormSchema2 = (t: Translator) => {
  return z
    .object({
      username: z.string().min(3, t('errors.validation.username_length').replace('zmin', '3')),
      email: z.string().email(t('errors.validation.email_invalid')),
      password: z.string().min(6, t('errors.validation.password_length').replace('zmin', '6')),
      password2: z.string(),
      csrf_token: z.string(),
    })
    .refine((data) => data.password === data.password2, {
      message: t('errors.validation.password_mismatch'),
      path: ['password2'],
    });
};

export const createCheckUsernameSchema = (t: Translator) => {
  return z.object({
    username: z.string().min(3, t('errors.validation.username_length').replace('zmin', '3')),
    csrf_token: z.string(),
  });
};

export const createLoginFormSchema = (t: Translator) => {
  return z.object({
    username: z.string().min(3, t('errors.validation.username_length').replace('zmin', '3')),
    password: z.string().min(6, t('errors.validation.password_length').replace('zmin', '6')),
    csrf_token: z.string(),
  });
};

export const createSignUpFormSchema = (t: Translator) => {
  // let lastCheckedUsername = '';
  // let usernameIsAvailable = false;
  return z
    .object({
      username: z.string().min(3, t('errors.validation.username_length').replace('zmin', '3')),
      email: z.string().email(t('errors.validation.email_invalid')),
      password: z.string().min(6, t('errors.validation.password_length').replace('zmin', '6')),
      password2: z.string(),
      csrf_token: z.string(),
    })
    .superRefine(async (data, ctx) => {
      // Password confirmation check
      if (data.password !== data.password2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.password_mismatch'),
          path: ['password2'],
        });
      }

      // const currentUsername = data.username.trim();
      // const usernameChanged = currentUsername !== lastCheckedUsername;

      // if (usernameChanged) {
      //   usernameIsAvailable = false;
      // }

      // // Username availability check
      // if (currentUsername.length >= 3 && usernameChanged && !usernameIsAvailable) {
      //   try {
      //     const formData = new FormData();
      //     formData.append('csrf_token', data.csrf_token);
      //     formData.append('username', currentUsername);

      //     const response = await checkUsernameAction(formData);

      //     lastCheckedUsername = currentUsername;
      //     console.log('lastCheckedUsername:', lastCheckedUsername);

      //     if (!response.success) {
      //       ctx.addIssue({
      //         code: z.ZodIssueCode.custom,
      //         message: response.message || t('errors.validation.username_taken'),
      //         path: ['username'],
      //       });
      //     } else {
      //       usernameIsAvailable = true;
      //     }
      //   } catch (error) {
      //     ctx.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       message: t('errors.validation.action_failed'),
      //       path: ['username'],
      //     });
      //   }
      // }
    });
};
