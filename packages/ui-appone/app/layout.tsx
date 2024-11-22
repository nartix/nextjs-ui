import React from 'react';
import { Metadata, Viewport } from 'next';
import clsx from 'clsx';

import '@nartix/ui-appone/styles/globals.css';

import { Providers } from '@nartix/ui-appone/app/providers';

import { siteConfig } from '@nartix/ui-appone/config/site';
import { fontSans } from '@nartix/ui-appone/config/fonts';

import Header from '@nartix/ui-appone/components/common/Header';
import Footer from '@nartix/ui-appone/components/common/Footer';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning={true} lang='en'>
      <head />
      <body className={clsx('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'light', children: children }}>
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
