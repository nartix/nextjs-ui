'use client';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Container from '@/components/common/ui/Container';
import FormBuilder, { ButtonProps, FormDataValues, ActionResponse } from '@/components/common/FormBuilder';
import { loginFields } from '@/app/[locale]/(common)/form/formFields';
import { loginSchema } from '@/app/[locale]/(auth)/form/schemas';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';

const buttons: ButtonProps[] = [
  {
    text: 'Login',
    color: 'primary',
  },
];

export default function Login() {
  const t = useTranslations();

  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (session) {
  //     router.push('/');
  //   }
  // }, [session, router]);

  // const handleSubmit = async (data: FormDataValues): Promise<ActionResponse> => {
  //   const username = data.username as string;
  //   const password = data.password as string;

  //   try {
  //     const result = await signIn('credentials', {
  //       redirect: false, // Avoid client-side redirection
  //       username,
  //       password,
  //     });

  //     if (result?.ok) {
  //       // Authentication successful
  //       return { success: true };
  //     } else {
  //       let errorMessage = t('errors.error_unexpected');

  //       if (result?.error === 'CredentialsSignin') {
  //         errorMessage = t('auth.error_invalid_credentials');
  //       }
  //       // Should not reach here since throwOnError is true
  //       return {
  //         success: false,
  //         message: errorMessage,
  //       };
  //     }
  //   } catch (error: any) {
  //     // Catch the error thrown by signIn
  //     return {
  //       success: false,
  //       message: error.message || t('auth.auth_failed'),
  //     };
  //   }
  // };

  return (
    <Container as='main' className='flex-grow pt-10 px-6 flex flex-col items-center'>
      <Suspense fallback={<div>t('common.laoding')</div>}>
        <FormBuilder
          heading={t('auth.login')}
          fields={loginFields}
          buttons={buttons}
          variant='bordered'
          // action={handleSubmit}
          action={loginAction}
          formSchema={loginSchema}
          handleRedirect={true}
        />
      </Suspense>
    </Container>
  );
}
