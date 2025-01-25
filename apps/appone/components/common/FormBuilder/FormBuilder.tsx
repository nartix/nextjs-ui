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
} from '@mantine/core';
import { useFormContext, FormProvider, useForm, SubmitHandler, UseFormReturn, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';

export type FieldComponentFn = (methods: UseFormReturn<any>) => React.ReactNode;

// A single field (like before, but you can add optional layout props like colSpan)
interface FormFieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'password' | 'number' | 'hidden' | 'component';
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  validation?: ZodTypeAny;
  options?: { label: string; value: string }[];
  component?: ReactNode | FieldComponentFn;
  onChange?: (input: string) => string;
  layout?: {
    props?: Record<string, any>; // e.g. { withAsterisk: true } for the all the mantine types
    gridColProps?: Record<string, any>; // e.g. { span: 8 }
  };
}

// Each row is simply an array of fields
interface FormRow {
  fields: FormFieldConfig[];
}

// A section can contain a title, optional description, and multiple rows
interface FormSection {
  title?: string;
  description?: string;
  rows: FormRow[];
  layout?: {
    gridProps?: Record<string, any>; // e.g. { gutter: 'md' }
    fieldsetProps?: Record<string, any>;
  };
}

// The overall form config is just an array of sections
export interface FormConfig {
  // props?: any;
  sections: FormSection[];
  title?: string;
  beforeSubmitText?: ReactNode;
  submitText?: string;
  afterSubmitText?: ReactNode;
  layout?: {
    titleProps?: Record<string, any>;
    errorAlertProps?: Record<string, any>;
  };
}

interface SectionRendererProps {
  section: FormSection;
  formState: any;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, formState }) => {
  const { isSubmitting } = formState;

  const fieldSetProps = {
    legend: section.title,
    ...section.layout?.fieldsetProps?.title,
  };

  // size='sm' mt='xs' mb='md'
  const descriptionProps = {
    mt: 'xs',
    mb: 'md',
    size: 'sm',
    ...section.layout?.fieldsetProps?.description,
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
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              // RHF bridging
              onChange={onChange}
              onBlur={onBlur}
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
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Textarea
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={onChange}
              onBlur={onBlur}
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
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={onChange}
              onBlur={onBlur}
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
          defaultValue={field.defaultValue ?? false}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Checkbox
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              description={field.description}
              error={error}
              {...field.layout?.props}
              onChange={onChange}
              onBlur={onBlur}
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
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, value } }) => (
            <Select
              label={field.label}
              data={field.options ?? []}
              error={error}
              {...field.layout?.props}
              // Bridge Mantine’s onChange(value => ...) to RHF
              onChange={(val) => onChange(val)}
              value={value}
            />
          )}
        />
      );
    case 'radio':
      return (
        <Controller
          name={field.name}
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, value } }) => (
            <Radio.Group
              label={field.label}
              value={value}
              onChange={onChange} // string => ...
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

    // -------------------------------------------------------------------
    // 7) Number
    // -------------------------------------------------------------------
    case 'number':
      return (
        <Controller
          name={field.name}
          // If user does not specify defaultValue, we fallback to 0
          defaultValue={field.defaultValue ?? 0}
          render={({ field: { onChange, value } }) => (
            <NumberInput
              label={field.label}
              error={error}
              {...field.layout?.props}
              // Mantine’s NumberInput onChange => (val: number) => void
              onChange={(val) => onChange(val ?? 0)}
              // If the user typed a string or something, ensure numeric
              value={typeof value === 'number' ? value : Number(value) || 0}
            />
          )}
        />
      );

    // -------------------------------------------------------------------
    // 8) Hidden
    // -------------------------------------------------------------------
    case 'hidden':
      return (
        <Controller
          name={field.name}
          defaultValue={field.defaultValue ?? ''}
          render={({ field: { onChange, value, ref } }) => (
            <input
              type='hidden'
              // Spread any additional props
              {...field.layout?.props}
              // Use the "field" from Controller
              onChange={onChange}
              value={value}
              ref={ref}
            />
          )}
        />
      );

    // -------------------------------------------------------------------
    // 9) Component
    // -------------------------------------------------------------------
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
function getDefaultValueByType(type: FormFieldConfig['type']): any {
  switch (type) {
    case 'checkbox':
      return false;
    case 'select':
    case 'radio':
      return '';
    case 'number':
      return 0;
    case 'hidden':
      return '';
    default:
      return '';
  }
}

export function buildDefaultValues(formConfig: FormConfig): Record<string, any> {
  const defaultValues: Record<string, any> = {};
  formConfig.sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.fields.forEach((field) => {
        defaultValues[field.name] = field.defaultValue ?? getDefaultValueByType(field.type);
      });
    });
  });
  return defaultValues;
}

export interface FormBuilderProps<T = unknown> {
  formConfig: FormConfig;
  submitHandler: (data: T, setError: unknown) => Promise<unknown>;
  loading?: boolean;
}

export const FormBuilder = <T extends Record<string, any>>({ formConfig, submitHandler }: FormBuilderProps<T>) => {
  const zodSchema = buildZodSchema(formConfig);

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: buildDefaultValues(formConfig), // or from the config
  });

  const { handleSubmit, setError, formState } = methods;

  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      await submitHandler(data, setError);
    } catch (err: any) {
      setError('root.serverError', {
        type: 'server',
        message: err.message || 'Unknown server error',
      });
    }
  };

  const titleProps = {
    order: 2,
    ta: 'center',
    ...formConfig.layout?.titleProps?.title,
  };

  const errorAlertProps = {
    variant: 'light',
    color: 'red',
    styles: (theme: any) => ({ message: { color: theme.colors.red[8] } }),
    ...formConfig.layout?.errorAlertProps,
  };

  return (
    // <Container
    //   w='100%'
    //   size={400}

    // ></Container>
    <FormProvider {...methods}>
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
export function buildZodSchema(formConfig: FormConfig): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {};

  formConfig.sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.fields.forEach((field) => {
        shape[field.name] = field.validation ?? z.any();
      });
    });
  });

  return z.object(shape);
}
