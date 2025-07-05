import { z, ZodIssue } from 'zod';
import { isApiValidationErrorList, mapApiValidationErrorsToZodIssues } from '@/lib/utils';

type GenericErrorResponse = {
  success: false;
  errors?: ZodIssue[];
  message?: string;
};

interface ErrorHandlerOptions {
  response?: Response;
  errorData?: unknown;
  t?: (key: string) => string; // i18n translation function, optional
  fallbackMessage?: string;
}

export async function handleServerActionError(error: unknown, options: ErrorHandlerOptions = {}): Promise<GenericErrorResponse> {
  const t = options.t ?? ((key: string) => key);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      success: false,
      errors: error.issues,
      message: error.issues.length === 1 ? error.issues[0].message : undefined,
    };
  }

  // Handle fetch/API errors
  if (options.response && options.errorData && typeof options.errorData === 'object' && options.errorData !== null) {
    const { response, errorData } = options;

    const err = errorData as Record<string, unknown>;

    if (response.status === 400 && err.errorCode === 'VALIDATION_FAILED' && isApiValidationErrorList(err.errors)) {
      const issues = mapApiValidationErrorsToZodIssues(err.errors);
      return {
        success: false,
        errors: issues,
        message: issues.length === 1 ? issues[0].message : undefined,
      };
    }

    // Handle 404 not found
    if (response.status === 404) {
      return {
        success: false,
        message: (err.detail as string) || t('errors.not_found') || 'Not found',
      };
    }
    // Other API error cases
    return {
      success: false,
      message: (err.detail as string) || t('errors.error_unexpected'),
    };
  }

  // Handle other/unexpected errors
  return {
    success: false,
    message: t('errors.error_unexpected'),
  };
}
