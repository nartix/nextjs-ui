'use client';

import { AppShell, UnstyledButton, RemoveScroll, Flex } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';
import { Footer } from '@/components/common/Footer/Footer';
import classes from '@/components/common/Layout/Layout.module.scss';
import { ReactNode } from 'react';
import { Header } from '@/components/common/Header/Header';

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
      <Header opened={opened} toggle={toggle} />

      <AppShell.Navbar
        py='md'
        px={4}
        // slide from right
        // style={{
        //   right: 0,
        //   left: 'auto',
        //   transform: !opened ? 'translateX(100%)' : 'translateX(0)',
        //   transition: 'transform 0.3s ease',
        // }}
      >
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
