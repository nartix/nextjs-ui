import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { ContentContainer } from '@/components/common/ui/content-container';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

export default async function Login() {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/');
  }

  return (
    <ContentContainer className='flex flex-col items-center'>
      <LoginForm />
    </ContentContainer>
  );
}
