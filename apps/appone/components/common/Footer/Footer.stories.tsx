import React from 'react';
import { Footer } from './Footer';
import { AppShell, Container } from '@mantine/core';
import { cn } from '@/lib/utils';

// Optional: Only if you want to log actions (e.g., from '@storybook/addon-actions'):
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Footer/Footer',
  component: Footer,
  // This component will have an automatically generated Autodocs entry
  // if you're on Storybook 7+ and have Autodocs configured.
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  // If you needed to pass any callbacks for demonstration, you could define them here:
  /*
  args: {
    onSomeEvent: action('some-event'), 
  },
  */
};

const Template = () => {
  return (
    <AppShell>
      <Container className={cn('pt-10')} size='lg'>
        <Footer />
      </Container>
    </AppShell>
  );
};

export const Default = {
  args: {},
  render: Template,
};
