'use client';

import { z, ZodTypeAny } from 'zod';
import {
  Grid,
  Fieldset,
  Text,
  TextInput,
  Button,
  Stack,
  Checkbox,
  PasswordInput,
  Title,
  Alert,
  Select,
  NumberInput,
  Radio,
  Group,
  Textarea,
  ComboboxItem,
  TitleProps,
  MantineTheme,
} from '@mantine/core';
import {
  useFormContext,
  FormProvider,
  useForm,
  SubmitHandler,
  UseFormReturn,
  Controller,
  ControllerProps,
  FieldValues,
  UseFormProps,
  DefaultValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';

export type FieldComponentFn = (methods: UseFormReturn<FieldValues>) => React.ReactNode;

export interface FormFieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'password' | 'number' | 'hidden' | 'component';
  placeholder?: string;
  description?: string;
  // defaultValue?: unknown;
  // validation?: ZodTypeAny;
  options?: { label: string; value: string }[];
  component?: ReactNode | FieldComponentFn;
  onChange?: {
    (e: React.ChangeEvent<HTMLElement>): void;
    (value: string | null, option?: ComboboxItem): void;
  };
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  controllerProps?: Omit<ControllerProps, 'render' | 'control' | 'name'>;
  layout?: {
    props?: Record<string, unknown>; // e.g. { withAsterisk: true } for the all the mantine types
    gridColProps?: Record<string, unknown>; // e.g. { span: 8 }
  };
  // [key: string]: any;
}

export interface FormRow {
  fields: FormFieldConfig[];
}

export type FormConfigFn<T extends FieldValues> = (methods: UseFormReturn<T>) => FormConfig;

// A section can contain a title, optional description, and multiple rows
export interface FormSection {
  title?: string;
  description?: string;
  rows: FormRow[];
  layout?: {
    gridProps?: Record<string, unknown>; // e.g. { gutter: 'md' }
    fieldsetProps?: Record<string, unknown>;
  };
}

// The overall form config is just an array of sections
export interface FormConfig {
  sections: FormSection[];
  title?: string;
  beforeSubmitText?: ReactNode;
  submitText?: string;
  afterSubmitText?: ReactNode;
  layout?: {
    titleProps?: TitleProps;
    errorAlertProps?: Record<string, unknown>;
  };
  // validationSchema?: z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>>;
}

interface SectionRendererProps {
  section: FormSection;
  formState: FieldValues;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, formState }) => {
  const { isSubmitting } = formState;

  const fieldSetProps = {
    legend: section.title,
    ...(section.layout?.fieldsetProps?.title || {}),
  };

  const descriptionProps = {
    mt: 'xs',
    mb: 'md',
    size: 'sm',
    ...(section.layout?.fieldsetProps?.description ?? {}),
  };

  return (
    <Fieldset disabled={isSubmitting} {...fieldSetProps}>
      {section.description && <Text {...descriptionProps}>{section.description}</Text>}
      {section.rows.map((row: FormRow, rowIndex: number) => (
        <Grid key={rowIndex} {...section.layout?.gridProps}>
          {row.fields.map((field: FormFieldConfig) => (
            <Grid.Col key={field.name} className={field.type === 'hidden' ? 'hidden' : ''} {...field.layout?.gridColProps}>
              <FieldRenderer field={field} />
            </Grid.Col>
          ))}
        </Grid>
      ))}
    </Fieldset>
  );
};

interface FieldRendererProps {
  field: FormFieldConfig;
}
export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
  const methods = useFormContext();
  const {
    formState: { errors },
  } = methods;

  const error = errors[field.name]?.message?.toString();

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={(e) => {
                onChange(e);
                if (field.onChange) {
                  field.onChange(e);
                }
              }}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              value={value || ''}
              ref={ref}
            />
          )}
        />
      );
    case 'textarea':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Textarea
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={(e) => {
                onChange(e);
                if (field.onChange) {
                  field.onChange(e);
                }
              }}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              value={value || ''}
              ref={ref}
            />
          )}
        />
      );
    case 'password':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={(e) => {
                onChange(e);
                if (field.onChange) {
                  field.onChange(e);
                }
              }}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              value={value || ''}
              ref={ref}
            />
          )}
        />
      );
    case 'checkbox':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? false}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Checkbox
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={(e) => {
                onChange(e);
                if (field.onChange) {
                  field.onChange(e);
                }
              }}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              // Mantine expects a boolean for Checkbox
              checked={!!value}
              ref={ref}
            />
          )}
        />
      );
    case 'select':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, value } }) => (
            <Select
              label={field.label}
              data={field.options ?? []}
              error={error}
              {...field.layout?.props}
              onChange={(val) => {
                onChange(val);
                if (field.onChange) {
                  field.onChange(val, undefined);
                }
              }}
              value={value}
            />
          )}
        />
      );
    case 'radio':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value } }) => (
            <Radio.Group
              label={field.label}
              value={value}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              onChange={(e) => {
                onChange(e);
                if (field.onChange) {
                  field.onChange(e);
                }
              }}
              error={error}
              {...field.layout?.props}
            >
              <Group mt='xs'>
                {field.options?.map((option) => <Radio key={option.value} value={option.value} label={option.label} />)}
              </Group>
            </Radio.Group>
          )}
        />
      );
    case 'number':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? 0}
          render={({ field: { onChange, onBlur, value } }) => (
            <NumberInput
              label={field.label}
              error={error}
              {...field.layout?.props}
              onChange={(val) => onChange(val ?? 0)}
              onBlur={(e) => {
                field.onBlur?.(e);
                onBlur();
              }}
              value={typeof value === 'number' ? value : Number(value) || 0}
            />
          )}
        />
      );
    case 'hidden':
      return (
        <Controller
          name={field.name}
          {...field.controllerProps}
          // defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, value, ref } }) => (
            <input type='hidden' {...field.layout?.props} onChange={onChange} value={value} ref={ref} />
          )}
        />
      );
    case 'component': {
      if (typeof field.component === 'function') {
        const componentFn = field.component as FieldComponentFn;
        return <>{componentFn(methods)}</>;
      }
      return <>{field.component ?? null}</>;
    }

    default:
      return null;
  }
};

/**
 * Returns a default value based on the field type.
 */
// function getDefaultValueByType(type: FormFieldConfig['type']): any {
//   switch (type) {
//     case 'checkbox':
//       return false;
//     case 'select':
//     case 'radio':
//       return '';
//     case 'number':
//       return 0;
//     case 'hidden':
//       return '';
//     default:
//       return '';
//   }
// }

// export function buildDefaultValues(formConfig: FormConfig): Record<string, any> {
//   const defaultValues: Record<string, any> = {};
//   formConfig.sections.forEach((section) => {
//     section.rows.forEach((row) => {
//       row.fields.forEach((field) => {
//         defaultValues[field.name] = field.defaultValue ?? getDefaultValueByType(field.type);
//       });
//     });
//   });
//   return defaultValues;
// }

export type AsyncDefaultValues<T> = Promise<DefaultValues<T>>;

export interface FormBuilderProps<T extends FieldValues = FieldValues> {
  config: (methods: UseFormReturn<T>) => FormConfig;
  submitHandler: (data: T, useFormMethods: UseFormReturn<T>) => Promise<unknown>;
  loading?: boolean;
  defaultValues?: DefaultValues<T> | undefined;
  schema?: ZodTypeAny;
  useFormProps?: UseFormProps<T>;
}

function getServerErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message || 'Unknown server error' : 'Unknown server error';
}

export const FormBuilder = <T extends FieldValues = FieldValues>({
  config,
  submitHandler,
  defaultValues,
  schema,
  useFormProps,
}: FormBuilderProps<T>) => {
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues,
    ...useFormProps,
  });

  const formConfig = config(methods);
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});
  const extendedMethods = { ...methods, successMessages, setSuccessMessages };

  const { handleSubmit, setError, formState } = methods;
  const { errors, isSubmitting, isDirty, isValid } = formState;

  const onSubmit: SubmitHandler<T> = async (data) => {
    try {
      if (!isDirty) {
        const rootError = errors.root?.serverError;
        if (rootError) {
          setError('root.serverError', {
            type: 'server',
            message: rootError.message,
          });
        }
        return;
      }
      await submitHandler(data, methods);
    } catch (err: unknown) {
      setError('root.serverError', {
        type: 'server',
        message: getServerErrorMessage(err),
      });
    }
  };

  const titleProps: TitleProps = {
    order: 2 as const,
    ta: 'center',
    // ...(formConfig.layout?.titleProps?.title || {}),
    ...formConfig.layout?.titleProps,
  };

  // styles: (theme: any) => ({ message: { color: theme.colors.red[8] } }),
  const errorAlertProps = {
    variant: 'light',
    color: 'red',
    styles: (theme: MantineTheme) => ({
      message: { color: theme.colors.red[8] },
      root: { border: `1px solid ${theme.colors.red[3]}` },
    }),
    ...formConfig.layout?.errorAlertProps,
  };

  return (
    <FormProvider {...extendedMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack align='stretch'>
          {formConfig.title && <Title {...titleProps}>{formConfig.title}</Title>}
          {/* Global/Root Error Display */}
          {errors.root?.serverError && <Alert {...errorAlertProps}>{errors.root.serverError.message}</Alert>}
          {formConfig.sections.map((section, index) => (
            <SectionRenderer key={index} section={section} formState={formState} />
          ))}
          {formConfig.beforeSubmitText}
          <Button type='submit' loading={isSubmitting}>
            {formConfig.submitText ?? 'Submit'}
          </Button>
          {formConfig.afterSubmitText}
        </Stack>
      </form>
    </FormProvider>
  );
};

/**
 * Builds a Zod schema based on the form configuration.
 */
// export function buildZodSchema(formConfig: FormConfig): z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>> {
//   if (formConfig.validationSchema) {
//     return formConfig.validationSchema;
//   }

//   const shape: Record<string, ZodTypeAny> = {};
//   formConfig.sections.forEach((section) => {
//     section.rows.forEach((row) => {
//       row.fields.forEach((field) => {
//         shape[field.name] = field.validation ?? z.any();
//       });
//     });
//   });

//   return z.object(shape);
// }
