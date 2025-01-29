import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { Text, Title } from '@mantine/core';
import { extractSessionForClientside } from '@/app/[locale]/(auth)/lib/exgract-session-for-clientside';

export default async function Home() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('HomePage');

  const lorem =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?';

  return (
    <BaseContainer justify='flex-start' align='center' session={extractSessionForClientside(session) || null}>
      <Title order={4}>
        App One {t('title')} Welcome {user ? user.username : 'Guest'}
      </Title>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          //  className='max-w-2xl'
          <Text size='md' key={index} className='max-w-2xl'>
            {lorem}
          </Text>
        ))}
    </BaseContainer>
  );
}

// export default async function Home() {
//   return (
//     <BaseContainer justify='flex-start' align='center'>
//       <HomeContent />
//     </BaseContainer>
//   );
// }
