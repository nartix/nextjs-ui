import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@nartix/auth-appone';
import { ContentContainer } from '@/components/common/ui/content-container';
// import { ContentSkeleton } from '@/components/common/ui/skeleton/skeleton-content';
import { authConfig } from '@/app/[locale]/(auth)/auth-options';

async function HomeContent() {
  const session = await getServerSession(authConfig);
  const user = session?.user;

  const t = await getTranslations('HomePage');

  return (
    <div>
      <h1>
        App One {t('title')} Welcome {user ? user.username : 'Guest'}
      </h1>
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
        lacus. In pellentesque massa placerat duis ultricies. Sit amet massa vitae tortor condimentum. Morbi tincidunt augue.
      </p>
    </div>
  );
}

export default async function Home() {
  return (
    <>
      <ContentContainer>
        <HomeContent />
      </ContentContainer>
      {/* <ContentSkeleton /> */}
    </>
  );
}
