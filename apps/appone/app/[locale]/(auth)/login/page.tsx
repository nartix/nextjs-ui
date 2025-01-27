import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import React from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default async function Login() {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/');
  }
  return <LoginForm />;
}
