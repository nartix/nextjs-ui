'use client';

import { useTranslations } from 'next-intl';

import FormBuilder, { ButtonProps } from '@/components/common/FormBuilder';
import { loginFields } from '@/app/[locale]/(common)/form/formFields';
import { loginSchema } from '@/app/[locale]/(auth)/form/schemas';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';

const buttons: ButtonProps[] = [
  {
    text: 'Login',
    color: 'primary',
  },
];

export function LoginForm() {
  const t = useTranslations();

  return (
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
  );
}
