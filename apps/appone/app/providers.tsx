'use client';

import * as React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
// import { SessionProvider } from 'next-auth/react';
// import { SessionProvider } from '@/app/[locale]/(auth)/context/session-context';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  messages?: AbstractIntlMessages;
  locale?: string;
}

export function Providers({ children, themeProps, messages, locale }: ProvidersProps) {
  const router = useRouter();

  return (
    // <SessionProvider value={session}>
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
    // </SessionProvider>
  );
}
