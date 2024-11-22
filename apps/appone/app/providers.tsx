'use client';

import * as React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { SessionProvider } from 'next-auth/react';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  messages?: AbstractIntlMessages;
  locale?: string;
}

export function Providers({ children, themeProps, messages, locale }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
  );
}
