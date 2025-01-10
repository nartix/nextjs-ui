'use client';

import * as React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
// import { SessionProvider } from 'next-auth/react';
import { SessionProvider } from '@/app/[locale]/(auth)/context/session-context';
import { SessionObj } from '@nartix/next-security';
import { CSRFProvider } from '@/app/[locale]/(common)/context/csrf-context';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/styles/theme';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  messages?: AbstractIntlMessages;
  locale?: string;
  session: SessionObj | null;
  csrfToken?: string | null;
}

export function Providers({ children, themeProps, messages, locale, session, csrfToken }: ProvidersProps) {
  const router = useRouter();

  return (
    <SessionProvider value={session}>
      <CSRFProvider value={csrfToken ?? null}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <MantineProvider theme={theme}>
            <NextUIProvider navigate={router.push}>
              <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
            </NextUIProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </CSRFProvider>
    </SessionProvider>
  );
}
