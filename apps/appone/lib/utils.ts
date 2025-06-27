import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiValidationError } from '@/types';
import { ZodIssue, ZodIssueCode } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapApiValidationErrorsToZodIssues(errors: readonly ApiValidationError[]): ZodIssue[] {
  return errors.map(
    (err): ZodIssue => ({
      code: ZodIssueCode.custom,
      path: Array.isArray(err.field) ? err.field : [err.field],
      message: err.message,
      ...(err.code ? { fatal: err.code === 'fatal' } : {}),
    })
  );
}

export function isApiValidationErrorList(errors: unknown): errors is ApiValidationError[] {
  return Array.isArray(errors) && errors.every((e) => e && typeof e === 'object' && 'field' in e && 'message' in e);
}
