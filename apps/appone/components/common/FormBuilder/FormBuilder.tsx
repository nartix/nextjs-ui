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
  Container,
  Title,
  Alert,
  Select,
  RadioGroup,
  NumberInput,
  Radio,
} from '@mantine/core';
import { useFormContext, FormProvider, useForm, SubmitHandler, UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode } from 'react';

// A single field (like before, but you can add optional layout props like colSpan)
interface FormFieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'password' | 'number' | 'hidden' | 'component';
  props?: any;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  validation?: ZodTypeAny;
  options?: { label: string; value: string }[];
  component?: ReactNode;
  gridColProps?: any; // props to pass to the grid
  gridColSpan?: number; // how many columns to span if using a 12-column grid, for instance
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
  beforeSubmitText?: ReactNode;
  submitText?: string;
  afterSubmitText?: ReactNode;
}

function renderRow(row: FormRow) {
  return (
    <Grid>
      {row.fields.map((field) => (
        <Grid.Col key={field.name} span={field.gridColSpan ?? 12}>
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

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, formState }) => {
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
      {section.description && <Text {...descriptionProps}>{section.description}</Text>}
      {section.rows.map((row: FormRow, rowIndex: number) => (
        <Grid key={rowIndex} align='flex-end' justify='flex-start' grow mb='md'>
          {row.fields.map((field: FormFieldConfig) => (
            <Grid.Col key={field.name} className={field.type === 'hidden' ? 'hidden' : ''} {...field.gridColProps}>
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

const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[field.name]?.message?.toString();

  const commonProps = {
    id: field.name,
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    error,
    ...register(field.name),
    ...field.props,
  };

  switch (field.type) {
    case 'text':
      return <TextInput {...commonProps} />;
    case 'password':
      return <PasswordInput {...commonProps} />;
    case 'checkbox':
      return <Checkbox label={field.label} {...commonProps} />;
    case 'select':
      return <Select data={field.options || []} {...commonProps} />;
    case 'radio':
      return (
        <RadioGroup {...commonProps}>
          {field.options?.map((option) => <Radio key={option.value} value={option.value} label={option.label} />)}
        </RadioGroup>
      );
    case 'number':
      return <NumberInput {...commonProps} />;
    case 'hidden':
      return <input type='hidden' {...register(field.name)} defaultValue={field.defaultValue as string} {...field.props} />;
    case 'component':
      return field.component ?? null;
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

/**
 * Builds default values for the form based on the configuration.
 */
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

interface FormBuilderProps<T = unknown> {
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

  // 4) onSubmit with server error handling
  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      await submitHandler(data, setError);
    } catch (err: any) {
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
        maxWidth: '400px', // Optional: Set a maximum width if desired
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
            {formConfig.beforeSubmitText}
            <Button type='submit' loading={isSubmitting}>
              {formConfig.submitText ?? 'Submit'}
            </Button>
            {formConfig.afterSubmitText}
          </Stack>
        </form>
      </FormProvider>
    </Container>
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
