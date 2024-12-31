import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { ContentContainer } from '@/components/common/ui/content-container';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';

export default async function Login() {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/');
  }

  const headersList = await headers();
  const csrfToken = headersList.get('x-csrf-token') || '';

  return (
    <ContentContainer className='flex flex-col items-center'>
      <LoginForm csrfToken={csrfToken} />
    </ContentContainer>
  );
}
