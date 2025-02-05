'use client';

import React, { useEffect } from 'react';
import { FormConfig, FormBuilder } from '@nartix/mantine-form-builder/src';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { createSchemas, createSignUpFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { z, ZodObject } from 'zod';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Text, Anchor, Container, Loader } from '@mantine/core';
import { Link } from '@/i18n/routing';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';
import { useActionHandler } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { signupAction } from '@/app/[locale]/(auth)/actions/signup-action';

export function SignupForm() {
  const t = useTranslations('errors');
  const signUpFormSchema = createSignUpFormSchema(t);

  const { CSRFToken } = useCSRFToken();

  const formConfig: FormConfig = {
    validationSchema: signUpFormSchema,
    title: 'Sign Up',
    // beforeSubmitText: 'Please enter your username and password',
    submitText: 'Sign Up',
    // props: {
    //   title: {
    //     order: 1,
    //     ta: 'center',
    //   },
    // },
    sections: [
      {
        // title: 'Personal Information',
        // description: 'Please enter your personal information',
        // props: {
        //   title: {
        //     variant: 'unstyled',
        //     classNames: { legend: 'text-left' },
        //   },
        // description: {
        //   className: 'text-right',
        // },
        // },
        // mb: 'sm',
        layout: {
          gridProps: { align: 'flex-end', justify: 'flex-start', mb: 'sm' },
        },
        rows: [
          // {
          //   fields: [
          //     {
          //       name: 'input1',
          //       label: 'Name',
          //       placeholder: 'Enter your name',
          //       description: 'Input description',
          //       type: 'text',
          //     },
          //     {
          //       name: 'input2',
          //       label: 'Form Input 2',
          //       placeholder: 'Enter your name',
          //       // description: 'Input description',
          //       type: 'text',
          //     },
          //   ],
          // },
          {
            fields: [
              {
                name: 'username',
                label: 'Username',
                type: 'text',
                // validation: signUpFormSchema._def.schema.shape.username,
                // props: { withAsterisk: true },
                // colSpan: 8,
                // defaultValue: 'bill',
                // gridColProps: { span: 8 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'email',
                label: 'Email',
                type: 'text',
                // validation: signUpFormSchema._def.schema.shape.email,
                // props: { withAsterisk: true },
                // colSpan: 8,
                // defaultValue: 'bill',
                // gridColProps: { span: 8 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                // validation: signUpFormSchema._def.schema.shape.password,
                // gridColProps: { span: 6 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'password2',
                label: 'Confirm Password',
                type: 'password',
                // validation: signUpFormSchema._def.schema.shape.password2,
                // gridColProps: { span: 6 },
              },
            ],
          },
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
      // {
      //   title: 'Test Section',
      //   rows: [
      //     {
      //       fields: [
      //         {
      //           name: 'showUserInfo',
      //           type: 'component',
      //           component: ({ watch, formState, setValue }) => {
      //             // watch returns the value of any field
      //             const username = watch('username', '');
      //             const rememberMe = watch('rememberme', false);

      //             // You can also read errors or isValid, etc., from formState
      //             const { errors } = formState;

      //             // // For demonstration, let's update some hidden field if username changes
      //             // if (username.includes('test')) {
      //             //   setValue('password', 'TestUserCSRF');
      //             // } else {
      //             //   setValue('password', '');
      //             // }

      //             return (
      //               <div style={{ color: 'blue' }}>
      //                 {`Username: ${username}`}
      //                 <br />
      //                 {`Remember me? ${rememberMe}`}
      //                 {errors.username && <p style={{ color: 'red' }}>Username Error: {String(errors.username.message)}</p>}
      //               </div>
      //             );
      //           },
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  };

  const { handler: ActionHandler, isRedirecting } = useActionHandler({
    action: signupAction,
    onSuccessRedirect: true,
  });

  return (
    <>
      {isRedirecting ? (
        <Loader size={30} mt='lg' />
      ) : (
        <Container w='100%' size={400} mt='lg'>
          <FormBuilder formConfig={formConfig} submitHandler={ActionHandler} />
        </Container>
      )}
    </>
  );
}
