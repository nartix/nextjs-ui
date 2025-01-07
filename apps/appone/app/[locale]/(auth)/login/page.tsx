import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { ContentContainer } from '@/components/common/ui/content-container';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SignJWT, jwtVerify } from 'jose';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function Login() {
  // const secret = new TextEncoder().encode('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2');
  // const alg = 'HS256';

  // const jwt = await new SignJWT({ 'urn:example:claim': true, test: 'test' })
  //   .setProtectedHeader({ alg })
  //   .setIssuedAt()
  //   // .setIssuer('urn:example:issuer')
  //   // .setAudience('urn:example:audience')
  //   .setExpirationTime('4s')
  //   .sign(secret);

  // console.log('jwt', jwt);

  // // Wait for 6 seconds
  // await delay(6000);

  // // Verify the token
  // try {
  //   const { payload } = await jwtVerify(jwt, secret);
  //   console.log('Token is valid:', payload);
  // } catch (error) {
  //   console.error('Token is invalid:', error);
  // }

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
