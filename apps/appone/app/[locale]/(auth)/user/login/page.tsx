import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import React from 'react';
import { LoginForm } from '@/components/auth/user/login/LoginForm';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';

export default async function Login() {
  const session = await getServerSession();
  if (session?.user) {
    redirect('/');
  }
  return (
    <SessionContainer>
      <LoginForm />
    </SessionContainer>
  );
}
