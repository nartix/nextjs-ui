'use client';

import Container from '@/app/(common)/components/ui/Containers';
import FormBuilder, { ButtonProps } from '@/app/(common)/components/FormBuilder';
import { loginAction } from '@/app/[locale]/(auth)/actions/loginAction';
import { loginFields } from '@/app/(common)/form/formFields';
import { loginSchema } from '@/app/[locale]/(auth)/form/schemas';
import { Suspense } from 'react';

export default function Login() {
  const buttons: ButtonProps[] = [
    {
      text: 'Login',
      color: 'primary',
    },
  ];

  return (
    <Container as='main' className='flex-grow pt-10 px-6 flex flex-col items-center'>
      <Suspense fallback={<div>Loading...</div>}>
        <FormBuilder
          heading='Login'
          fields={loginFields}
          buttons={buttons}
          variant='bordered'
          action={loginAction}
          formSchema={loginSchema}
        />
      </Suspense>
    </Container>
  );
}
