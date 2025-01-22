'use client';
import React from 'react';

import { FormConfig, FormBuilder } from '@/components/common/FormBuilder/FormBuilder';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { z } from 'zod';
import { loginActionTest } from '@/app/[locale]/(auth)/actions/login-test-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Text, Anchor } from '@mantine/core';
import { Link } from '@/i18n/routing';

export function TestLoginForm() {
  const csrf_token = useCSRFToken();
  const formConfig: FormConfig = {
    title: 'Login',
    // beforeSubmitText: 'Please enter your username and password',
    submitText: 'Sign In',
    afterSubmitText: (
      <Text ta='center' size='sm'>
        Don't have an account?{' '}
        <Anchor component={Link} href='/'>
          Register
        </Anchor>
      </Text>
    ),
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
        rows: [
          // {
          //   fields: [
          //     {
          //       name: 'input1',
          //       label: 'Name',
          //       placeholder: 'Enter your name',
          //       description: 'Input description',
          //       type: 'text',
          //       colSpan: 4,
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
                validation: loginFormSchema.shape.username,
                // props: { withAsterisk: true },
                // colSpan: 8,
                defaultValue: 'bill',
                gridColProps: { span: 3 },
              },
              {
                name: 'username2',
                label: 'Username',
                type: 'text',
                validation: loginFormSchema.shape.username,
                // props: { withAsterisk: true },
                // colSpan: 8,
                defaultValue: 'bill',
                gridColProps: { span: 6 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                validation: loginFormSchema.shape.password,
                gridColProps: { span: 6 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'rememberme',
                label: 'Keep me logged in',
                type: 'checkbox',
                gridColProps: { span: 6 },
                // props: { size: 'xs', classNames: { body: 'flex justify-end ' } },
              },
              {
                name: 'forgotpassword',
                type: 'component',
                gridColProps: { ta: 'right', span: 6 },
                component: (
                  <Anchor href='/' component={Link} size='sm'>
                    Forgot Password
                  </Anchor>
                ),
              },
            ],
          },
          {
            fields: [
              {
                name: 'csrf_token',
                type: 'hidden',
                defaultValue: csrf_token,
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
      const response = await loginActionTest(data);
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

  return (
    <BaseContainer>
      <FormBuilder formConfig={formConfig} submitHandler={loginActionTestHandler} />
    </BaseContainer>
  );
}
