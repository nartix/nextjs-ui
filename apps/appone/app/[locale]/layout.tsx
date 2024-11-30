import { Metadata, Viewport } from 'next';
import React from 'react';
import clsx from 'clsx';

import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';

import '@/styles/globals.css';

import { Providers } from './../providers';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';

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
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // const session = await getServerSession();

  return (
    <html suppressHydrationWarning={true} lang={locale}>
      <head />
      <body className={clsx('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <Providers
          // session={session}
          locale={locale}
          messages={messages}
          themeProps={{ attribute: 'class', defaultTheme: 'light', children: children }}
        >
          <div className='relative flex flex-col h-screen'>
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
