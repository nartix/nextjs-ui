import { Flex, FlexProps } from '@mantine/core';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseContainerProps extends FlexProps {
  children: ReactNode;
}

export function BaseContainer({ children, ...flexProps }: BaseContainerProps) {
  const defaultSettings: FlexProps = {
    direction: 'column',
    gap: 'md',
    justify: 'flex-start',
    align: 'center',
    className: 'flex flex-1',
  };

  const combinedProps = {
    ...defaultSettings,
    ...flexProps,
    className: cn(defaultSettings.className, flexProps.className),
  };

  return <Flex {...combinedProps}>{children}</Flex>;
}
