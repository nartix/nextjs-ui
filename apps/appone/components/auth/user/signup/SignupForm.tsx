'use client';

import React, { useEffect, useState } from 'react';
import { FormConfig, FormBuilder } from '@nartix/mantine-form-builder/src';
import { createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Container, Loader } from '@mantine/core';
// import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Controller, FieldValues, useFormContext, UseFormReturn } from 'react-hook-form';
import { useActionHandler } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { signupAction } from '@/app/[locale]/(auth)/actions/signup-action';
import { checkUsernameAction } from '@/app/[locale]/(auth)/actions/check-username-action';
import { IconCheck } from '@tabler/icons-react';
import { z } from 'zod';

export function SignupForm() {
  const t = useTranslations();

  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(false);
  const signUpFormSchema = createSignUpFormSchema(t);
  type SchemaType = z.infer<typeof signUpFormSchema>;
  const handleUsernameCheck = async (value: string, methods: UseFormReturn<SchemaType>) => {
    const { setError, clearErrors } = methods;
    const trimmed = value.trim();
    setUsernameAvailable(false);
    if (trimmed.length < 3) return;

    const formData = new FormData();
    formData.append('csrf_token', CSRFToken || '');
    formData.append('username', trimmed);

    try {
      const response = await checkUsernameAction(formData);
      if (!response.success) {
        setError('username', { message: response.message ?? 'An unknown error occurred' });

        setUsernameAvailable(false);
      } else {
        clearErrors('username');
        setUsernameAvailable(true);
      }
    } catch (error: any) {
      setUsernameAvailable(false);
      console.error('Username check error:', error);
    }
  };

  // function useCustomUsernameCheck() {
  //   const methods = useFormContext();
  //   console.log('methods:', methods);
  //   return async (e: React.FocusEvent<HTMLElement>) => {
  //     await handleUsernameCheck((e.target as HTMLInputElement).value, methods);
  //   };
  // }

  const { CSRFToken } = useCSRFToken();

  const config2 = (methods: UseFormReturn<SchemaType>): FormConfig => {
    return {
      layout: {
        errorAlertProps: { classNames: { message: 'text-red-700' } },
      },
      title: 'Sign Up',
      submitText: 'Sign Up',
      sections: [
        {
          layout: {
            gridProps: { align: 'flex-end', justify: 'flex-start', mb: 'sm' },
          },
          rows: [
            {
              fields: [
                {
                  name: 'username',
                  label: 'Username',
                  type: 'text',
                  layout: {
                    props: {
                      rightSectionWidth: usernameAvailable ? 36 : 0,
                      rightSection: usernameAvailable ? <IconCheck size={16} color='green' /> : null,
                      onKeyDown: async (e: React.KeyboardEvent<HTMLElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                          const form = (e.currentTarget as HTMLInputElement).form;
                          if (!form) return;
                          const index = Array.prototype.indexOf.call(form, e.currentTarget);
                          if (form.elements[index + 1]) {
                            (form.elements[index + 1] as HTMLElement).focus();
                          }
                        }
                      },
                    },
                  },
                  onBlur: async (e: React.FocusEvent<HTMLElement>) => {
                    await handleUsernameCheck((e.target as HTMLInputElement).value, methods);
                  },
                },
              ],
            },
            { fields: [{ name: 'email', label: 'Email', type: 'text' }] },
            { fields: [{ name: 'password', label: 'Password', type: 'password' }] },
            { fields: [{ name: 'password2', label: 'Confirm Password', type: 'password' }] },
            {
              fields: [
                {
                  name: 'csrf_token',
                  type: 'component',
                  component: ({ setValue }: { setValue: UseFormReturn<FieldValues>['setValue'] }) => {
                    useEffect(() => {
                      if (CSRFToken) setValue('csrf_token', CSRFToken);
                    }, [CSRFToken]);
                    return (
                      <>
                        <Controller
                          name='csrf_token'
                          defaultValue={CSRFToken}
                          render={({ field: { onChange, onBlur, value, ref } }) => (
                            <input name='csrf_token' type='hidden' value={value} ref={ref} onChange={onChange} onBlur={onBlur} />
                          )}
                        />
                      </>
                    );
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  };

  const formConfig: FormConfig = {
    validationSchema: signUpFormSchema,
    layout: {
      errorAlertProps: { classNames: { message: 'text-red-700' } },
    },
    title: 'Sign Up',
    submitText: 'Sign Up',
    sections: [
      {
        layout: {
          gridProps: { align: 'flex-end', justify: 'flex-start', mb: 'sm' },
        },
        rows: [
          {
            fields: [
              {
                name: 'username',
                label: 'Username',
                type: 'text',
                layout: {
                  props: {
                    rightSectionWidth: usernameAvailable ? 36 : 0,
                    rightSection: usernameAvailable ? <IconCheck size={16} color='green' /> : null,
                    onKeyDown: async (e: React.KeyboardEvent<HTMLElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                        const form = (e.currentTarget as HTMLInputElement).form;
                        if (!form) return;
                        const index = Array.prototype.indexOf.call(form, e.currentTarget);
                        if (form.elements[index + 1]) {
                          (form.elements[index + 1] as HTMLElement).focus();
                        }
                      }
                    },
                  },
                },
                // onBlur: useCustomUsernameCheck(),
              },
            ],
          },
          { fields: [{ name: 'email', label: 'Email', type: 'text' }] },
          { fields: [{ name: 'password', label: 'Password', type: 'password' }] },
          { fields: [{ name: 'password2', label: 'Confirm Password', type: 'password' }] },
          {
            fields: [
              {
                name: 'csrf_token',
                type: 'component',
                component: ({ setValue }) => {
                  useEffect(() => {
                    if (CSRFToken) setValue('csrf_token', CSRFToken);
                  }, [CSRFToken]);
                  return (
                    <>
                      <Controller
                        name='csrf_token'
                        defaultValue={CSRFToken}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <input name='csrf_token' type='hidden' value={value} ref={ref} onChange={onChange} onBlur={onBlur} />
                        )}
                      />
                    </>
                  );
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const { formAction, isRedirecting } = useActionHandler<SchemaType>({
    action: signupAction,
    onSuccessRedirect: true,
    t,
  });

  return (
    <>
      {isRedirecting ? (
        <Loader size={30} mt='lg' />
      ) : (
        <Container w='100%' size={400} mt='lg'>
          <FormBuilder<SchemaType> schema={signUpFormSchema} config={config2} submitHandler={formAction} />
        </Container>
      )}
    </>
  );
}
