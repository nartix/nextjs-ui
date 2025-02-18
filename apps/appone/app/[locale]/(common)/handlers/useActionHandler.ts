'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z, ZodIssue } from 'zod';
import type { UseFormReturn, FieldValues, UseFormSetError, Path } from 'react-hook-form';

/**
 * Converts an array of Zod issues into a field-to-message map.
 */
// export function mapActionResponseErrorsToForm<T extends FieldValues>(
//   response: ActionResponse,
//   setError: UseFormSetError<T>
// ): void {
//   if (response.error) {
//     throw new Error(response.error);
//   }

//   // Iterate over each error in the errors array and set it directly.
//   if (response.errors && Array.isArray(response.errors)) {
//     response.errors.forEach((err) => {
//       if (typeof err === 'string') {
//         // // For a string error, assign it to a generic field.
//         // setError('_root' as keyof T, {
//         //   type: 'server',
//         //   message: err,
//         // });
//       } else {
//         // For a ZodIssue, create the field key by joining the path.
//         const fieldKey = err.path.join('.') as Path<T>;
//         setError(fieldKey, {
//           type: 'server',
//           message: err.message,
//         });
//       }
//     });
//   }
// }

export function mapActionResponseErrorsToForm<T extends FieldValues>(
  response: ActionResponse,
  setError: UseFormSetError<T>
): void {
  if (response.error) {
    throw new Error(response.error);
  }

  // Process the errors property if it exists.
  if (response.errors) {
    if (!Array.isArray(response.errors)) {
      // Assume a flattened error object.
      // Expected shape:
      // {
      //   formErrors: string[] | Array<{ message: string; errorCode: string }>;
      //   fieldErrors: Record<string, string[] | Array<{ message: string; errorCode: string }>>;
      // }
      const flattened = response.errors as {
        formErrors: Array<string | { message: string; errorCode: string }>;
        fieldErrors: Record<string, Array<string | { message: string; errorCode: string }>>;
      };

      // Process form-level errors.
      if (flattened.formErrors && flattened.formErrors.length > 0) {
        const combinedFormErrors = flattened.formErrors.map((e) => (typeof e === 'string' ? e : e.message)).join(' ');
        setError('root.serverError', {
          type: 'server',
          message: combinedFormErrors,
        });
      }

      // Process field-level errors.
      if (flattened.fieldErrors) {
        Object.entries(flattened.fieldErrors).forEach(([field, errors]) => {
          const combinedFieldError = errors.map((err) => (typeof err === 'string' ? err : err.message)).join(' ');
          setError(field as Path<T>, {
            type: 'server',
            message: combinedFieldError,
          });
        });
      }
    } else {
      // Process errors if they are in array format.
      (response.errors as Array<ZodIssue | string>).forEach((err) => {
        if (typeof err === 'string') {
          setError('root.serverError', {
            type: 'server',
            message: err,
          });
        } else {
          const fieldKey = err.path.join('.') as Path<T>;
          setError(fieldKey, {
            type: 'server',
            message: err.message,
          });
        }
      });
    }
  }
}

export type ActionParams = FormData | Record<string, unknown> | unknown;
export type ActionResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  errors?: Array<z.ZodIssue | string>;
  error?: string;
  errorCode?: string;
};
export type ServerActionResponse = (params: ActionParams) => Promise<ActionResponse>;
export type ServerAction<T = unknown> = (data: T) => Promise<ActionResponse>;
export interface ActionHandlerOptions<T> {
  action: ServerActionResponse;
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

  async function formAction(data: T, useFormMethods: UseFormReturn<T>): Promise<ActionResponse | unknown | void> {
    try {
      const response = await action(data);

      if (response.success) {
        // Trigger redirect and mark state as redirecting.
        setIsRedirecting(true);
        redirect();
        return response;
      } else {
        const { reset, getValues, setError } = useFormMethods;
        // If error is not unexpected, reset form errors.
        if (response.errorCode !== 'UNEXPECTED_ERROR') {
          // reset(getValues(), { keepErrors: true });
        }
        // If validation errors exist, map and set them.
        if (response.errors) {
          mapActionResponseErrorsToForm(response, setError);
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
