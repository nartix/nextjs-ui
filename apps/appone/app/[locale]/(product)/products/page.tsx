//–– this file stays a Server Component (no ‘use client’ at the top) ––
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Container } from '@mantine/core';
import { ProductsTable } from '@/components/product/ProductsTable/ProductsTable';
import { type Product } from '@/types';

export default async function ProductsPage() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('products');

  const additional: Product[] = Array.from({ length: 20 }, (_, i) => ({
    title: `Product ${i + 1}`,
    category: ['Electronics', 'Books', 'Clothing'][i % 3],
    price: (i + 1) * 10,
  }));

  const staticData: Product[] = [
    { title: 'Smartphone XYZ', category: 'Electronics', price: 599 },
    { title: 'The Great Gatsby', category: 'Books', price: 19 },
  ];

  const allData = [...additional, ...staticData];

  return (
    <SessionContainer justify='flex-start' align='center'>
      <Container size='md' w='100%'>
        <ProductsTable
          data={allData}
          translations={{
            title: t('title'),
            category: t('category'),
            price: t('price'),
          }}
        />
      </Container>
    </SessionContainer>
  );
}
