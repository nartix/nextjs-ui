'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

function mapZodIssuesToErrors(issues: z.ZodIssue[]): Record<string, string> {
  return issues.reduce(
    (acc, issue) => {
      const field = issue.path.join('.');
      if (!acc[field]) {
        acc[field] = issue.message;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: z.ZodIssue[];
  error?: string;
};

export type ServerAction<T = any> = (data: T) => Promise<ActionResponse>;

export interface ActionHandlerOptions<T> {
  action: ServerAction<T>;
  onSuccessRedirect?: boolean;
  defaultRedirect?: string; // fallback redirect path (defaults to '/')
}

/**
 * A custom hook that returns a generic action handler.
 *
 * @param options.action - The server action function to call.
 * @param options.onSuccessRedirect - Whether to redirect after a successful action.
 * @param options.defaultRedirect - The default redirect URL if none is provided in the URL search params.
 */
export function useActionHandler<T>(options: ActionHandlerOptions<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  /**
   * The handler function that can be used as a submit handler.
   *
   * @param data - The data to pass to your server action.
   * @param setError - A callback (from react-hook-form or similar) to set field/global errors.
   */
  async function handler(
    data: T,
    setError: (field: string, error: { message: string; type?: string }) => void
  ): Promise<ActionResponse | undefined> {
    try {
      console.log('useactiondata:', data);
      const response = await options.action(data);

      if (response.success) {
        if (options.onSuccessRedirect) {
          setIsRedirecting(true);
          const next = searchParams.get('next');
          router.push(next || options.defaultRedirect || '/');
        }
        return response;
      } else {
        if (response.errors) {
          const errors = mapZodIssuesToErrors(response.errors);
          Object.entries(errors).forEach(([field, message]) => {
            setError(field, { message });
          });
          return;
        }
        throw new Error(response.error || response.message || 'Action failed');
      }
    } catch (err: any) {
      // For example, the server action might throw an error with message 'NEXT_REDIRECT'
      if (err.message === 'NEXT_REDIRECT') {
        setIsRedirecting(true);
        return;
      }
      // Optionally, you can set a global form error or field-specific errors
      //   setError('global', { message: err.message });
      throw err;
    }
  }

  return { handler, isRedirecting };
}
