'use client';
import { Flex, FlexProps } from '@mantine/core';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SessionObj } from '@nartix/next-security';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';

interface BaseContainerProps extends FlexProps {
  children: ReactNode;
  session?: SessionObj | null;
  csrfToken?: string | null;
}

export function BaseContainer({ children, session, csrfToken, ...flexProps }: BaseContainerProps) {
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

  const { setCSRFToken } = useCSRFToken();
  useEffect(() => {
    setCSRFToken(csrfToken || null);
  }, [csrfToken, setCSRFToken]);

  const { setSession } = useSession();
  useEffect(() => {
    setSession(session || null);
  }, [session, setSession]);

  return <Flex {...combinedProps}>{children}</Flex>;
}
