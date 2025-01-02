'use client';
import { useTranslations } from 'next-intl';

import FormBuilder, { ButtonProps, FormBuilderProps } from '@/components/common/FormBuilder';
import { loginFields } from '@/app/[locale]/(common)/form/formFields';
import { loginSchema } from '@/app/[locale]/(auth)/form/login-schemas';
import { loginAction } from '@/app/[locale]/(auth)/actions/login-action';

const buttons: ButtonProps[] = [
  {
    text: 'Login',
    color: 'primary',
  },
];

export function LoginForm({ csrfToken, csrfTokenFieldName }: { csrfToken: string; csrfTokenFieldName?: string }) {
  const t = useTranslations();

  const formProps: FormBuilderProps<unknown> = {
    heading: t('auth.login'),
    fields: loginFields,
    buttons: buttons,
    variant: 'bordered',
    action: loginAction,
    formSchema: loginSchema,
    handleRedirect: true,
    csrfToken: csrfToken,
    ...(csrfTokenFieldName && { csrfTokenFieldName: csrfTokenFieldName }),
  };

  return <FormBuilder {...formProps} />;
}
