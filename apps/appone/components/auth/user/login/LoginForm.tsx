'use client';
import React, { useEffect } from 'react';

import { FormConfig, FormBuilder } from '@/components/common/FormBuilder/FormBuilder';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { loginFormSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { z } from 'zod';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Text, Anchor, Container, Loader } from '@mantine/core';
import { Link } from '@/i18n/routing';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller } from 'react-hook-form';

export function LoginForm() {
  const { CSRFToken } = useCSRFToken();
  const formConfig: FormConfig = {
    title: 'Login',
    // beforeSubmitText: 'Please enter your username and password',
    submitText: 'Sign In',
    afterSubmitText: (
      <Text ta='center' size='sm'>
        Don't have an account?{' '}
        <Anchor component={Link} href='/user/signup'>
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
                validation: loginFormSchema.shape.username,
                // props: { withAsterisk: true },
                // colSpan: 8,
                defaultValue: 'bill',
                // gridColProps: { span: 8 },
              },
              // {
              //   name: 'username2',
              //   label: 'Username',
              //   type: 'text',
              //   validation: loginFormSchema.shape.username,
              //   // props: { withAsterisk: true },
              //   // colSpan: 8,
              //   defaultValue: 'bill',
              //   gridColProps: { span: 9 },
              // },
            ],
          },
          {
            fields: [
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                validation: loginFormSchema.shape.password,
                // gridColProps: { span: 6 },
              },
            ],
          },
          {
            fields: [
              {
                name: 'rememberme',
                label: 'Keep me logged in',
                type: 'checkbox',
                layout: {
                  gridColProps: { span: 6 },
                },
                // props: { size: 'xs', classNames: { body: 'flex justify-end ' } },
              },
              {
                name: 'forgotpassword',
                type: 'component',
                layout: {
                  gridColProps: { ta: 'right', span: 6 },
                },
                component: (
                  <Anchor href='/user/reset-password' component={Link} size='sm'>
                    Forgot Password
                  </Anchor>
                ),
              },
            ],
          },
          // {
          //   fields: [
          //     {
          //       name: 'csrf_token',
          //       type: 'hidden',
          //       defaultValue: CSRFToken || '',
          //     },
          //   ],
          // },
          {
            fields: [
              {
                name: 'csrf_token',
                type: 'component',
                component: ({ setValue }) => {
                  useEffect(() => {
                    setValue('csrf_token', CSRFToken);
                  }, [CSRFToken]);
                  return (
                    <>
                      <Controller
                        name='csrf_token'
                        defaultValue={CSRFToken}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <input type='hidden' value={value} ref={ref} onChange={onChange} onBlur={onBlur} />
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

  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  async function loginActionHandler(data: any, setError: any) {
    try {
      const response = await loginAction(data);
      if (response && response.success) {
        setIsRedirecting(true);
        const next = searchParams.get('next');
        router.push(next || '/');
        return;
      } else {
        // setError('username', { message: 'Invalid username or password' });
        // setError('password', { type: 'manual', message: 'Invalid username or password' });
        throw new Error(response.message);
      }
    } catch (err: any) {
      // next redirect from server throws an error with message 'NEXT_REDIRECT'
      if (err.message === 'NEXT_REDIRECT') {
        setIsRedirecting(true);
        return;
      }
      // server action will throw unexpected error for csrf validation fails
      // The server says username or password is incorrect
      // We can show a "global" form error or field-specific errors
      // Example: a global form error
      // setError('username', { message: 'Invalid username or password' });
      throw err;
    }
  }

  //   <Container
  //   // size='md' // Adjusts the max-width based on predefined sizes
  //   style={{
  //     // minWidth: '200px', // Set your desired minimum width
  //     width: '100%', // Ensures the container takes full available width
  //     maxWidth: '400px', // Optional: Set a maximum width if desired
  //     margin: '0 auto', // Centers the container horizontally
  //   }}
  // >

  return (
    <>
      {isRedirecting ? (
        <Loader size={30} mt='lg' />
      ) : (
        <Container w='100%' size={400} mt='lg'>
          <FormBuilder formConfig={formConfig} submitHandler={loginActionHandler} />
        </Container>
      )}
    </>
  );
}
