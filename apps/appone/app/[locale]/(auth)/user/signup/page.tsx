import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/user/signup/SignupForm';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';

export default async function Signup() {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/');
  }
  return <SignupForm />;
}
