'use client';

import { AppShell, UnstyledButton, RemoveScroll, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Footer } from '@/components/common/Footer/Footer';
import classes from '@/components/common/Layout/Layout.module.scss';
import { ReactNode } from 'react';
import { Header } from '@/components/common/Header/Header';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Layout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  // This is make the header fixed at 120px when scrolled up, disappears when scrolled down
  // const pinned = useHeadroom({ fixedAt: 120 });

  // Add translation hook
  const tCommon = useTranslations('common');

  return (
    <AppShell
      //default height was 60
      // collapsed: opened ? false : !pinned,
      header={{ height: 55, offset: true }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      footer={{ height: 50, offset: false }}
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
        <UnstyledButton component={Link} className={classes.control} href='/about' onClick={toggle}>
          {tCommon('about')}
        </UnstyledButton>
        <UnstyledButton component={Link} className={classes.control} href='/eav-products' onClick={toggle}>
          {tCommon('eav_products')}
        </UnstyledButton>
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
