'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
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
  return (
    <SessionProvider initialSession={session}>
      <CSRFProvider initialCSRFToken={csrfToken || null}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <MantineProvider theme={theme}>
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </CSRFProvider>
    </SessionProvider>
  );
}
