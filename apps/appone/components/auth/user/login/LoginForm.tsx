'use client';
import React from 'react';
import { FormBuilder, FormConfigFn } from '@nartix/mantine-form-builder';
import { z } from 'zod';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { Text, Anchor, Container, Loader } from '@mantine/core';
import { Link } from '@/i18n/routing';
import { useActionHandler } from '@/app/[locale]/(common)/handlers/useActionHandler';
import { useTranslations } from 'next-intl';
import { createLoginFormSchema } from '@/app/[locale]/(common)/form/fieldSchemas';
import { HiddenCSRFTokenInput } from '@/components/auth/common/HiddenCSRFTokenInput';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export function LoginForm() {
  const t = useTranslations();
  const { CSRFToken } = useCSRFToken();
  const loginFormSchema = createLoginFormSchema(t);
  type loginFormType = z.infer<typeof loginFormSchema>;

  const formConfig: FormConfigFn<loginFormType> = () => {
    return {
      title: t('auth.login'),
      // beforeSubmitText: 'Please enter your username and password',
      submitText: t('auth.sign_in'),
      afterSubmitText: (
        <Text ta='center' size='sm'>
          Don&apos;t have an account? &nbsp;
          <Anchor component={Link} href='/user/signup'>
            Register
          </Anchor>
        </Text>
      ),
      sections: [
        {
          description: 'Username: feroz, Password: password',
          layout: {
            gridProps: { align: 'flex-end', justify: 'flex-start', mb: 'sm' },
            descriptionProps: { size: 'xs' },
          },
          rows: [
            {
              fields: [
                {
                  name: 'username',
                  label: 'Username',
                  type: 'text',
                },
              ],
            },
            {
              fields: [
                {
                  name: 'password',
                  label: 'Password',
                  type: 'password',
                },
              ],
            },
            // {
            //   fields: [
            //     {
            //       name: 'rememberme',
            //       label: 'Keep me logged in',
            //       type: 'checkbox',
            //       layout: {
            //         gridColProps: { span: 6 },
            //       },
            //     },
            //     {
            //       name: 'forgotpassword',
            //       type: 'component',
            //       layout: {
            //         gridColProps: { ta: 'right', span: 6 },
            //       },
            //       component: (
            //         <Anchor href='/user/reset-password' component={Link} size='sm'>
            //           Forgot Password
            //         </Anchor>
            //       ),
            //     },
            //   ],
            // },
            {
              fields: [
                {
                  name: 'csrf_token',
                  type: 'component',
                  component: ({ setValue }: { setValue: UseFormReturn<FieldValues>['setValue'] }) => (
                    <HiddenCSRFTokenInput setValue={setValue} CSRFToken={CSRFToken ?? undefined} />
                  ),
                },
              ],
            },
          ],
        },
      ],
    };
  };

  // const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  // const onSubmit = async (data: any) => {
  //   if (data.username === 'bill') {
  //     alert(JSON.stringify(data));
  //   } else {
  //     alert('There is an error');
  //   }
  // };

  // type LoginFormValues = z.infer<typeof loginFormSchema>;

  // 2) Example server-side "login" function
  // async function loginRequest(data: LoginFormValues, setError: any) {
  //   // Simulate a server call. We'll reject if username or password is wrong
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       if (data.username === 'user' && data.password === 'password') {
  //         alert('Login successful!');
  //         resolve('OK'); // success
  //       } else {
  //         reject(new Error('Invalid username or password'));
  //       }
  //     }, 1000);
  //   });
  // }

  const { formAction, isRedirecting } = useActionHandler<loginFormType>({
    action: loginAction,
    onSuccessRedirect: true,
    defaultRedirect: '/about',
    t,
  });

  return (
    <>
      {isRedirecting ? (
        <Loader size={30} mt='lg' />
      ) : (
        <Container w='100%' size={400} mt='lg'>
          <FormBuilder<loginFormType>
            defaultValues={{ username: '', password: '' }}
            schema={loginFormSchema}
            config={formConfig}
            submitHandler={formAction}
          />
        </Container>
      )}
    </>
  );
}
