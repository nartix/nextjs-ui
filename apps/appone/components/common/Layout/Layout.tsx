'use client';

import { AppShell, Burger, Group, UnstyledButton, Text, RemoveScroll, Avatar, Flex } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';
import { Footer } from '@/components/common/Footer/Footer';
import classes from '@/components/common/Layout/Layout.module.css';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <AppShell
      header={{ height: 60, collapsed: opened ? false : !pinned, offset: true }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding='md'
      styles={{
        main: {
          minHeight: 'auto', // Reset min-height
          height: '100%',
        },
      }}
    >
      <AppShell.Header>
        <Group h='100%' px='md' mx='auto'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Group justify='space-between' style={{ flex: 1 }}>
            <Text size='lg' fw={700} variant='gradient' gradient={{ from: 'gray', to: 'rgba(120, 73, 73, 1)', deg: 90 }}>
              FEROZ
            </Text>
            <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Home</UnstyledButton>
              <UnstyledButton className={classes.control}>Blog</UnstyledButton>
              <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
              <UnstyledButton className={classes.control}>Support</UnstyledButton>
            </Group>
            {/* <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Login</UnstyledButton>
            </Group> */}
            <Avatar radius='xl' size='md' />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py='md' px={4}>
        <UnstyledButton className={classes.control}>Home</UnstyledButton>
        <UnstyledButton className={classes.control}>Blog</UnstyledButton>
        <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
        <UnstyledButton className={classes.control}>Support</UnstyledButton>
      </AppShell.Navbar>
      <RemoveScroll enabled={opened}>
        <Flex direction='column' style={{ minHeight: '100vh' }}>
          <AppShell.Main className='flex grow'>{children}</AppShell.Main>
          <Footer />
        </Flex>
      </RemoveScroll>
    </AppShell>
  );
}
