'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import type { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * Converts an array of Zod issues into a field-to-message map.
 */
export function convertZodIssuesToErrors(issues: z.ZodIssue[]): Record<string, string> {
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

export type ActionParams<T> = FormData | Record<string, unknown> | T;
export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<z.ZodIssue | string>;
  error?: string;
  errorCode?: string;
};
export type ServerActionResponse<T> = (params: ActionParams<T>) => Promise<ActionResponse<T>>;
export type ServerAction<T = unknown> = (data: T) => Promise<ActionResponse<T>>;
export interface ActionHandlerOptions<T> {
  action: ServerActionResponse<T>;
  onSuccessRedirect?: boolean;
  defaultRedirect?: string; // fallback redirect path (defaults to '/')
  t: (key: string) => string;
}

/**
 * Encapsulates the redirection logic after a successful action.
 */
function useRedirectHandler(onSuccessRedirect?: boolean, defaultRedirect?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function redirect() {
    if (onSuccessRedirect) {
      const next = searchParams.get('next');
      router.push(next || defaultRedirect || '/');
    }
  }
  return redirect;
}

function updateFormErrors(
  errors: Array<z.ZodIssue | string>,
  setError: (field: string, error: { message: string; type?: string }) => void
) {
  const zodErrors = errors.filter((error): error is z.ZodIssue => typeof error !== 'string');
  const errorMap = convertZodIssuesToErrors(zodErrors);
  Object.entries(errorMap).forEach(([field, message]) => {
    setError(field, { message });
  });
}

/**
 * Custom hook for handling server actions.
 *
 * - Calls the provided action.
 * - On success, optionally redirects the user.
 * - On failure, resets form errors and maps Zod issues to field errors.
 *
 * @param options.action - The server action function to call.
 * @param options.onSuccessRedirect - Whether to redirect after a successful action.
 * @param options.defaultRedirect - Fallback URL for redirection.
 */
export function useActionHandler<T extends FieldValues = FieldValues>(options: ActionHandlerOptions<T>) {
  const { action, onSuccessRedirect, defaultRedirect, t } = options;
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const redirect = useRedirectHandler(onSuccessRedirect, defaultRedirect);

  async function formAction(
    data: T,
    setError: (field: string, error: { message: string; type?: string }) => void,
    formMethods: UseFormReturn<T>
  ): Promise<ActionResponse | undefined> {
    try {
      const response = await action(data);

      if (response.success) {
        // Trigger redirect and mark state as redirecting.
        setIsRedirecting(true);
        redirect();
        return response;
      } else {
        // If error is not unexpected, reset form errors.
        if (response.errorCode !== 'UNEXPECTED_ERROR') {
          const { reset, getValues } = formMethods;
          reset(getValues(), { keepErrors: true });
        }
        // If validation errors exist, map and set them.
        if (response.errors) {
          updateFormErrors(response.errors, setError);
          return;
        }
        // Fallback error handling.
        throw new Error(response.error || response.message || t('errors.action_failed'));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.message === 'NEXT_REDIRECT') {
        setIsRedirecting(true);
        return;
      }
      throw err;
    }
  }

  return { formAction, isRedirecting };
}
