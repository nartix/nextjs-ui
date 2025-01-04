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

  // useEffect(() => {
  //   const login = async () => {
  //     const response = await fetch('/login', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ username: 'username', password: 'password', csrf_token: csrfToken }),
  //     });

  //     if (response.ok) {
  //       console.log('Login successful!');
  //       // Handle successful login
  //     } else {
  //       const errorData = await response.json();
  //       console.error('Login failed:', errorData);
  //       // Handle login failure
  //     }
  //   };

  //   login();
  // }, []);

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
