import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Text, Title } from '@mantine/core';

export default async function Home() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('HomePage');

  const lorem =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?';

  return (
    <SessionContainer justify='flex-start' align='center'>
      <Title order={4}>
        App One {t('title')} Welcome {user ? user.username : 'Guest'}
      </Title>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          //  className='max-w-2xl'
          <Text size='md' key={index} className='max-w-2xl !text-red-700 !font-bold'>
            {lorem}
          </Text>
        ))}
    </SessionContainer>
  );
}
