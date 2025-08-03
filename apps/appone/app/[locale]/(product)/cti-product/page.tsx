import React from 'react';
// import { getTranslations } from 'next-intl/server';
// import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';

export default async function About() {
  return (
    <SessionContainer justify='flex-start' align='center' pt='lg' direction='column'>
      hello world
    </SessionContainer>
  );
}
