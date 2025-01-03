// types.ts
import { ZodType } from 'zod';
import { ButtonProps as NextUIButtonProps } from '@nextui-org/react';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'number'
  | 'file'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'hidden';

export interface FormField {
  type: FormFieldType;
  name: string;
  label: string;
  className?: string;
  placeholder?: string;
  isClearable?: boolean;
  options?: { label: string; value: string }[]; // For select, radio, etc.
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface FormBuilderProps<T = unknown> {
  fields: FormField[];
  heading?: string;
  buttons?: CustomButtonProps[];
  variant?: 'bordered' | 'faded' | 'underlined' | 'flat';
  className?: string;
  action?: (data: FormDataValues, req?: Request) => Promise<ActionResponse>;
  formSchema?: ZodType<T>;
  handleRedirect?: boolean;
  csrfToken?: string;
  csrfTokenFieldName?: string;
}

export interface CustomButtonProps extends Omit<NextUIButtonProps, 'children' | 'onClick'> {
  text: string;
  onClick?: () => void;
}

export interface FormDataValues {
  [key: string]: string | number | File | boolean;
}
