// import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
// import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import Container from '@/components/common/ui/Container';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  console.log('Session:', session);
  console.log('Home');

  const t = await getTranslations('HomePage');

  return (
    <Container as='main' className='flex-grow pt-10 px-6'>
      <h1>App One{t('title')}</h1>
      <p>
        Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Purus gravida quis blandit turpis. Augue neque gravida in fermentum et sollicitudin ac
        orci. Et sollicitudin ac orci phasellus egestas. Elementum tempus egestas sed sed risus pretium quam vulputate. Interdum
        velit euismod in pellentesque massa placerat duis ultricies. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices
        dui. Praesent semper feugiat nibh sed pulvinar. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque.
        Malesuada proin libero nunc consequat interdum varius sit amet. Lectus quam id leo in vitae. Sed viverra tellus in hac
        habitasse platea dictumst. Vivamus at augue eget arcu. Augue mauris augue neque gravida in. Tincidunt vitae semper quis
        lectus nulla at volutpat diam. Gravida dictum fusce ut placerat. Erat velit scelerisque in dictum non. Tempus quam
        pellentesque nec nam aliquam sem et tortor consequat. Eu nisl nunc mi ipsum faucibus. Cras fermentum odio eu feugiat
        pretium nibh. Vel pharetra vel turpis nunc eget lorem dolor sed viverra. Sollicitudin tempor id eu nisl nunc mi ipsum
        faucibus. Sed id semper risus in hendrerit gravida rutrum. Eget nulla facilisi etiam dignissim. Erat imperdiet sed euismod
        nisi. Risus in hendrerit gravida rutrum quisque non tellus orci ac. Tempor orci dapibus ultrices in iaculis nunc sed augue
        lacus. In pellentesque massa placerat duis ultricies. Sit amet massa vitae tortor condimentum. Morbi tincidunt augue
      </p>
    </Container>
  );
}
