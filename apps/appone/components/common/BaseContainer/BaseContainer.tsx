'use client';
import { Flex, FlexProps } from '@mantine/core';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SessionObj } from '@nartix/next-security/src';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';

interface BaseContainerProps extends FlexProps {
  children: ReactNode;
  session?: SessionObj | null;
}

export function BaseContainer({ children, session, ...flexProps }: BaseContainerProps) {
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

  const { setSession } = useSession();
  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  return <Flex {...combinedProps}>{children}</Flex>;
}
