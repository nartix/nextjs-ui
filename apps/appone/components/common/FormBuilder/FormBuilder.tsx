'use client';

import { z, ZodTypeAny } from 'zod';
import { Grid, Fieldset, Text, TextInput, Button, Stack, Checkbox, PasswordInput, Container, Title, Alert } from '@mantine/core';
import { useFormContext, FormProvider, useForm, SubmitHandler, UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// A single field (like before, but you can add optional layout props like colSpan)
interface FormFieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'password' | 'number' | 'hidden';
  props?: any;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  validation?: ZodTypeAny;
  options?: { label: string; value: string }[];
  // Layout-specific options (optional):
  colSpan?: number; // how many columns to span if using a 12-column grid, for instance
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
  props?: any;
}

// The overall form config is just an array of sections
export interface FormConfig {
  props?: any;
  sections: FormSection[];
  title?: string;
  submitText?: string;
}

function renderRow(row: FormRow) {
  return (
    <Grid>
      {row.fields.map((field) => (
        <Grid.Col key={field.name} span={field.colSpan ?? 12}>
          {/* Render your field here */}
        </Grid.Col>
      ))}
    </Grid>
  );
}

interface SectionRendererProps {
  section: FormSection;
  formState: any;
}

export function SectionRenderer({ section, formState }: SectionRendererProps) {
  const { isSubmitting } = formState;
  const fieldSetProps = {
    legend: section.title,
    ...section.props?.title,
  };

  // size='sm' mt='xs' mb='md'
  const descriptionProps = {
    mt: 'xs',
    mb: 'md',
    size: 'sm',
    ...section.props?.description,
  };

  return (
    <Fieldset disabled={isSubmitting} {...fieldSetProps}>
      {/* If the section has a description, display it below the legend */}
      {section.description && <Text {...descriptionProps}>{section.description}</Text>}

      {/* Render each row */}
      {section.rows.map((row: FormRow, rowIndex: number) => (
        <Grid key={rowIndex} align='flex-end' justify='flex-start' grow mb='md'>
          {row.fields.map((field: FormFieldConfig) => (
            <Grid.Col key={field.name} span={field.colSpan ?? 6} className={field.type === 'hidden' ? 'hidden' : ''}>
              <FieldRenderer field={field} />
            </Grid.Col>
          ))}
        </Grid>
      ))}
    </Fieldset>
  );
}

// A simple FieldRenderer that picks the correct Mantine component
function FieldRenderer({ field }: { field: FormFieldConfig }) {
  // useFormContext gives us access to the form methods (register, errors, etc.)
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // For demonstration, let's assume a simple text input:
  if (field.type === 'text') {
    return (
      <TextInput
        id={field.name}
        label={field.label}
        placeholder={field.placeholder}
        error={errors[field.name]?.message?.toString()}
        description={field.description}
        {...register(field.name)}
        {...field.props}
      />
    );
  }

  if (field.type === 'password') {
    return (
      <PasswordInput
        id={field.name}
        label={field.label}
        placeholder={field.placeholder}
        error={errors[field.name]?.message?.toString()}
        description={field.description}
        {...register(field.name)}
        {...field.props}
      />
    );
  }

  if (field.type === 'checkbox') {
    return <Checkbox id={field.name} label={field.label} {...register(field.name)} {...field.props} />;
  }

  if (field.type === 'hidden') {
    return (
      <input
        type='hidden'
        id={field.name}
        {...register(field.name)}
        value={(field.defaultValue as string) ?? ''}
        {...field.props}
      />
    );
  }

  // Handle other field types (select, checkbox, etc.) here.
  return null;
}

function buildDefaultValues(formConfig: FormConfig) {
  const defaultVals: Record<string, any> = {};
  formConfig.sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.fields.forEach((field) => {
        defaultVals[field.name] = field.defaultValue ?? '';
      });
    });
  });
  return defaultVals;
}

interface FormBuilderProps<T = unknown> {
  formConfig: FormConfig;
  submitHandler: (data: T, setError: unknown) => Promise<unknown>;
  loading?: boolean;
}

export const FormBuilder = <T,>({ formConfig, submitHandler }: FormBuilderProps<T>) => {
  const zodSchema = buildZodSchema(formConfig);
  // const onSubmit: SubmitHandler<any> = (data) => console.log(data);

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: buildDefaultValues(formConfig), // or from the config
  });

  const { handleSubmit, setError, formState, register } = methods;

  const { errors, isSubmitting } = formState;

  // 4) onSubmit with server error handling
  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      await submitHandler(data, setError);
      // If success, do something like redirect, show success, etc.
      // alert('Login successful!');
    } catch (err: any) {
      // The server says username or password is incorrect
      // We can show a "global" form error or field-specific errors
      // Example: a global form error
      setError('root.serverError', {
        type: 'server',
        message: err.message || 'Unknown server error',
      });

      // Or you might do field-specific, e.g.:
      // setError('username', { type: 'server', message: 'Username or password incorrect' });
      // setError('password', { type: 'server', message: 'Username or password incorrect' });
    }
  };

  const titleProps = {
    order: 2,
    ta: 'center',
    ...formConfig.props?.title,
  };

  return (
    <Container
      // size='md' // Adjusts the max-width based on predefined sizes
      style={{
        // minWidth: '200px', // Set your desired minimum width
        width: '100%', // Ensures the container takes full available width
        maxWidth: '350px', // Optional: Set a maximum width if desired
        margin: '0 auto', // Centers the container horizontally
      }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack align='stretch'>
            {formConfig.title && <Title {...titleProps}>{formConfig.title}</Title>}
            {/* Global/Root Error Display */}
            {errors.root?.serverError && (
              <Alert variant='light' color='red' styles={(theme) => ({ message: { color: theme.colors.red[8] } })}>
                {errors.root.serverError.message}
              </Alert>
            )}
            {formConfig.sections.map((section, index) => (
              <SectionRenderer key={index} section={section} formState={formState} />
            ))}
            <Button type='submit' loading={isSubmitting}>
              {formConfig.submitText ?? 'Submit'}
            </Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

/**
 * buildZodSchema
 *  - Loops over all sections, rows, and fields
 *  - Collects each field's validation schema (if any)
 *  - Returns a single z.object() that includes all fields by name
 */
export function buildZodSchema(formConfig: FormConfig) {
  // We'll store our shape in a standard JS object,
  // where each key maps to a Zod schema for that field
  const shape: Record<string, ZodTypeAny> = {};

  // Loop over every section
  formConfig.sections.forEach((section) => {
    // Loop over every row within the section
    section.rows.forEach((row) => {
      // Loop over each field in the row
      row.fields.forEach((field) => {
        // If the field has a custom validation schema, use it
        // Otherwise, default to z.any()
        shape[field.name] = field.validation ?? z.any();
      });
    });
  });

  // Return a single Zod object containing all field validations
  return z.object(shape);
}
