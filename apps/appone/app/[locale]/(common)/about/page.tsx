import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Text, Title } from '@mantine/core';

export default async function About() {
  const lorem =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?';

  return (
    <SessionContainer justify='flex-start' align='center' pt='lg' direction="column" >
      <Title order={4} className='max-w-2xl'>
        About this NextJS project
      </Title>

      <Text size='md' className='max-w-2xl'>
        {lorem}
      </Text>
    </SessionContainer>
  );
}
