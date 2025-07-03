import React from 'react';
import { getTranslations } from 'next-intl/server';
// import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Container } from '@mantine/core';
import { fetchWrapper } from '@/lib/fetch-wrapper';
import { EAVProductsTable, Product } from '@/components/product/ProductsTable/EAVProductTable';
import { API_URL } from '@/config/server-config';

export default async function EAVProductsPage() {
  // const session = await getServerSession();
  // const user = session?.user;

  const t = await getTranslations('products');

  const response = await fetchWrapper(`${API_URL}/eav/products`);
  let eavData: Product[] = [];
  if (response.ok) {
    const data = await response.json();
    eavData = data.content;
  } else {
    console.error('Failed to fetch EAV products:', response.statusText);
    return <div>Error loading EAV products</div>;
  }

  return (
    <SessionContainer justify='flex-start' align='center'>
      <Container size='md' w='100%'>
        <EAVProductsTable
          data={eavData}
          translations={{
            name: t('name'),
            brand: t('brand'),
            manufacturer: t('manufacturer'),
            price: t('price'),
            year: t('year'),
            color: t('color'),
          }}
        />
      </Container>
    </SessionContainer>
  );
}
