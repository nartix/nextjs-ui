import '@/styles/globals.scss';
// import '@/styles/_mantine.scss';
import '@mantine/core/styles.css';

import { Metadata, Viewport } from 'next';
import React, { useMemo } from 'react';

import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

import { routing, Locale } from '@/i18n/routing';

import { Providers } from './../providers';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Layout } from '@/components/common/Layout/Layout';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // preload session
  const session = await getServerSession();

  const headersList = await headers();
  const csrfToken = headersList.get('x-csrf-token') || '';

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={cn('min-h-screen', 'bg-background', 'font-sans', 'antialiased', fontSans.variable)}>
        <Providers
          session={session}
          locale={locale}
          messages={messages}
          themeProps={{ attribute: 'class', defaultTheme: 'light', children: children }}
          csrfToken={csrfToken}
        >
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
