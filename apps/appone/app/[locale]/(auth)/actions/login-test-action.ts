'use server';

import { z } from 'zod';
import { loginFormSchema } from '../form/login-schemas';

type LoginFormValues = z.infer<typeof loginFormSchema>;

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
};

export async function loginActionTest(data: LoginFormValues): Promise<ActionResponse> {
  // Simulate a server call. We'll reject if username or password is wrong

  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.username === 'user' && data.password === 'password') {
        resolve({ success: true }); // success
      } else {
        resolve({
          success: false,
          message: 'Username or password is incorrect',
        });
      }
    }, 1000);
  });
}
