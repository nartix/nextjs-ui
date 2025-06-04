/*
'use client';
import React from 'react';

// import { FormConfig, FormBuilder } from '@/components/common/FormBuilder/FormBuilder';
import { FormBuilder, FormConfig } from '@nartix/mantine-form-builder/src';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { z } from 'zod';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Text, Anchor, Container } from '@mantine/core';
import { Link } from '@/i18n/routing';

export function FormTest() {
  const { CSRFToken } = useCSRFToken();
  const formConfig: FormConfig = {
    title: 'Example Form',
    submitText: 'Submit',
    sections: [
      {
        title: 'Basic Fields',
        rows: [
          {
            fields: [
              {
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                // Example validation requiring non-empty
                // validation: z.string().nonempty('First Name is required'),
                defaultValue: 'ascas',
                // onChange: ({ watch, setValue }) => {
                //   const { firstName } = watch();
                //   console.log('onChange', firstName);
                //   setValue('firstName', firstName.toUpperCase());
                // },
                layout: {
                  props: { withAsterisk: true }, // optional Mantine prop
                },
              },
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                // Example password length check
                // validation: z.string().min(6, 'Password must be at least 6 characters'),
                defaultValue: '',
              },
            ],
          },
          {
            fields: [
              {
                name: 'age',
                label: 'Age',
                type: 'number',
                // Basic numeric validation
                validation: z.number().min(2, 'Age must be 2 or higher').max(8, 'Age must be 150 or lower'),
                defaultValue: 4,
                // layout: {
                //   props: { min: 2, max: 8 }, // optional Mantine prop
                // },
              },
              {
                name: 'subscribe',
                label: 'Subscribe to Newsletter',
                type: 'checkbox',
                validation: z.boolean().optional(),
                defaultValue: true,
              },
            ],
          },
          {
            fields: [
              {
                name: 'favoriteColor',
                label: 'Favorite Color',
                type: 'select',
                options: [
                  { label: 'Red', value: 'red' },
                  { label: 'Blue', value: 'blue' },
                  { label: 'Green', value: 'green' },
                ],
                defaultValue: 'blue',
                validation: z.string().min(1, 'Please pick a color'),
              },
              {
                name: 'gender',
                label: 'Gender',
                type: 'radio',
                options: [
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                  { label: 'Other2', value: 'other2' },
                  { label: 'Other1', value: 'other1' },
                ],
                defaultValue: 'female',
                validation: z.string().min(1, 'Please pick a gender'),
              },
            ],
          },
          {
            fields: [
              // Hidden field to demonstrate usage
              {
                name: 'secretToken',
                type: 'hidden',
                defaultValue: 'ABC123',
              },
            ],
          },
          {
            fields: [
              // Hidden field to demonstrate usage
              {
                name: 'textarea',
                label: 'Textarea',
                type: 'textarea',
                defaultValue: 'ABC123',
                layout: {
                  // props: { resize: 'vertical' },
                },
              },
            ],
          },
        ],
      },
      {
        // A second section that displays all values in real-time
        title: 'All Values',
        rows: [
          {
            fields: [
              {
                name: 'valuesViewer',
                type: 'component',
                // This function receives all RHF methods (including watch, setValue, etc.)
                component: ({ watch }) => {
                  const allValues = watch(); // watch all fields
                  return <pre style={{ background: '#f3f3f3', padding: '1rem' }}>{JSON.stringify(allValues, null, 2)}</pre>;
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (data: any) => {
    if (data.username === 'bill') {
      alert(JSON.stringify(data));
    } else {
      alert('There is an error');
    }
  };

  type LoginFormValues = z.infer<typeof loginFormSchema>;

  // 2) Example server-side "login" function
  async function loginRequest(data: LoginFormValues, setError: any) {
    // Simulate a server call. We'll reject if username or password is wrong
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.username === 'user' && data.password === 'password') {
          alert('Login successful!');
          resolve('OK'); // success
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 1000);
    });
  }

  async function loginActionTestHandler(data: any, setError: any) {
    try {
      const response = await loginAction(data);
      if (response && response.success) {
        // If success, do something like redirect, show success, etc.
        alert('Login successful!');
        // return response;
      } else {
        // setError('username', { message: 'Invalid username or password' });
        // setError('password', { type: 'manual', message: 'Invalid username or password' });
        throw new Error(response.message);
      }
    } catch (err: any) {
      // server action will throw unexpected error for csrf validation fails
      // The server says username or password is incorrect
      // We can show a "global" form error or field-specific errors
      // Example: a global form error
      // setError('username', { message: 'Invalid username or password' });
      throw err;
    }
  }

  const submitHandler = async (data: any) => {
    alert(JSON.stringify(data, null, 2));
  };

  return <FormBuilder formConfig={formConfig} submitHandler={submitHandler} />;
}
  */
