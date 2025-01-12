import React from 'react';
import { Footer } from './Footer';
import { AppShell, Container } from '@mantine/core';
import { clsx } from 'clsx';

export function FooterStory() {
  return (
    <AppShell>
      <Container className={clsx('pt-10')} size='lg'>
        <Footer />
      </Container>
    </AppShell>
  );
}
