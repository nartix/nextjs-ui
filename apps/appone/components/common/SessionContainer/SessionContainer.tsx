import { FlexProps } from '@mantine/core';
import { ReactNode } from 'react';
import { SessionObj } from '@nartix/next-security/src';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { getCsrfToken } from '@/app/[locale]/(auth)/lib/get-csrf-token';

interface SessionContainerProps extends FlexProps {
  children: ReactNode;
  session?: SessionObj | null;
}

export async function SessionContainer({ children, ...flexProps }: SessionContainerProps) {
  const session = await getServerSession();
  await getCsrfToken();

  const combinedProps = {
    session,
    ...flexProps,
  };

  return <BaseContainer {...combinedProps}>{children}</BaseContainer>;
}
