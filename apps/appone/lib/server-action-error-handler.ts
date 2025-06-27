import { z, ZodIssue } from 'zod';
import { isApiValidationErrorList, mapApiValidationErrorsToZodIssues } from '@/lib/utils';

type GenericErrorResponse = {
  success: false;
  errors?: ZodIssue[];
  message?: string;
};

interface ErrorHandlerOptions {
  response?: Response;
  errorData?: any;
  t?: (key: string) => string; // i18n translation function, optional
  fallbackMessage?: string;
}

export async function handleServerActionError(error: unknown, options: ErrorHandlerOptions = {}): Promise<GenericErrorResponse> {
  const t = options.t ?? ((key: string) => key);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return { success: false, errors: error.issues };
  }

  // Handle fetch/API errors
  if (options.response && options.errorData) {
    const { response, errorData } = options;
    // Example: API validation errors
    if (response.status === 400 && errorData.errorCode === 'VALIDATION_FAILED' && isApiValidationErrorList(errorData.errors)) {
      return {
        success: false,
        errors: mapApiValidationErrorsToZodIssues(errorData.errors),
      };
    }
    // Other API error cases
    return {
      success: false,
      message: errorData.detail || t('errors.error_unexpected'),
    };
  }

  // Handle other/unexpected errors
  return {
    success: false,
    message: t('errors.error_unexpected'),
  };
}
