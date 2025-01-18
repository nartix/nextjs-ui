import { z, ZodTypeAny } from 'zod';
import { Grid, Fieldset, Text, TextInput, Button, Stack, Checkbox, PasswordInput, Container, Title } from '@mantine/core';
import { useFormContext, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// A single field (like before, but you can add optional layout props like colSpan)
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'password';
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
}

export function SectionRenderer({ section }: SectionRendererProps) {
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
    <Fieldset {...fieldSetProps}>
      {/* If the section has a description, display it below the legend */}
      {section.description && <Text {...descriptionProps}>{section.description}</Text>}

      {/* Render each row */}
      {section.rows.map((row: FormRow, rowIndex: number) => (
        <Grid key={rowIndex} align='flex-end' justify='flex-start' grow mb='md'>
          {row.fields.map((field: FormFieldConfig) => (
            <Grid.Col key={field.name} span={field.colSpan ?? 6}>
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
      />
    );
  }

  if (field.type === 'checkbox') {
    return <Checkbox id={field.name} label={field.label} {...register(field.name)} />;
  }

  // Handle other field types (select, checkbox, etc.) here.
  return null;
}

export const FormBuilder = ({ formConfig }: { formConfig: FormConfig }) => {
  const zodSchema = buildZodSchema(formConfig); // merges all fields' validations
  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {}, // or from the config
  });

  const titleProps = {
    order: 2,
    ta: 'center',
    ...formConfig.props?.title,
  };

  return (
    <Container
      size='sm' // Adjusts the max-width based on predefined sizes
      style={{
        // minWidth: '300px', // Set your desired minimum width
        width: '100%', // Ensures the container takes full available width
        maxWidth: '300px', // Optional: Set a maximum width if desired
        margin: '0 auto', // Centers the container horizontally
      }}
    >
      <FormProvider {...methods}>
        <form>
          <Stack align='stretch'>
            {formConfig.title && <Title {...titleProps}>{formConfig.title}</Title>}
            {formConfig.sections.map((section, index) => (
              <SectionRenderer key={index} section={section} />
            ))}
            <Button type='submit'>{formConfig.submitText ?? 'Submit'}</Button>
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
