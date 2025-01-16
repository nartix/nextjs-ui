import React from 'react';
import { BaseContainer } from './BaseContainer';
import { Text } from '@mantine/core';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/common/Layout/Layout';

// Optional: Only if you want to log actions (e.g., from '@storybook/addon-actions'):
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/BaseContainer/BaseContainer',
  component: BaseContainer,
  // This component will have an automatically generated Autodocs entry
  // if you're on Storybook 7+ and have Autodocs configured.
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  // If you needed to pass any callbacks for demonstration, you could define them here:

  args: {
    align: 'center',
    justify: 'center',
    direction: 'column',
    gap: 'md',
    className: 'flex flex-1',
    itemCount: 6,
    baseText: 'Base Text',
  },
  argTypes: {
    align: {
      options: ['flex-start', 'center', 'flex-end'],
      control: { type: 'select' },
    },
    justify: {
      control: { type: 'select' },
      options: ['flex-start', 'center', 'flex-end'],
    },
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'] as any[],
    },
    gap: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
    itemCount: {
      control: { type: 'number' },
    },
    baseText: {
      control: { type: 'text' },
    },
  },
};

interface TemplateProps {
  align: string;
  justify: string;
  direction: any;
  gap: string;
  className: string;
  itemCount: number;
  baseText: string;
}

const Template = ({ align, justify, direction, gap, className, itemCount, baseText }: TemplateProps) => {
  return (
    <Layout>
      <BaseContainer align={align} justify={justify} direction={direction} gap={gap} className={className}>
        {Array(itemCount)
          .fill(0)
          .map((_, index) => (
            //  className='max-w-2xl'
            <Text size='md' key={index} className='max-w-2xl'>
              {baseText}
            </Text>
          ))}
      </BaseContainer>
    </Layout>
  );
};

export const Default = {
  args: {
    align: 'flex-start',
    justify: 'flex-end',
    direction: 'column',
    gap: 'md',
    className: 'flex flex-1',
    itemCount: 6,
    baseText:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?',
  },
  render: Template,
};
