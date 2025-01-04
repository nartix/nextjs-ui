import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { ContentContainer } from '@/components/common/ui/content-container';
// import { ContentSkeleton } from '@/components/common/ui/skeleton/skeleton-content';

async function TestContent() {
  const session = await getServerSession();
  const session2 = await getServerSession();
  const user = session?.user;
  console.log('session from TestContent', session?.sessionId || 'Guest');

  const t = await getTranslations('HomePage');

  return (
    <div>
      <h1>
        Test {t('title')} Welcome {user ? user.username : 'Guest'}
      </h1>
      <p>
        Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Purus gravida quis blandit turpis. Augue neque gravida in fermentum et sollicitudin ac
      </p>
    </div>
  );
}

export default async function Test() {
  return (
    <>
      <ContentContainer>
        <TestContent />
      </ContentContainer>
    </>
  );
}
