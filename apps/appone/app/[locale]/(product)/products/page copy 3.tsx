'use server';

import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Container } from '@mantine/core';
import { GenericMantineTable } from '@/components/common/Table/MantineReactTable';
import { type MRT_ColumnDef } from 'mantine-react-table';
import { type Product } from '@/types';

export default async function Products() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('HomePage');

  // Generate additional product data
  const additionalData: Product[] = Array.from({ length: 20 }, (_, i) => ({
    title: `Product ${i + 1}`,
    category: ['Electronics', 'Books', 'Clothing'][i % 3],
    price: (i + 1) * 10,
  }));

  // Static product data
  const data: Product[] = [
    { title: 'Smartphone XYZ', category: 'Electronics', price: 599 },
    { title: 'The Great Gatsby', category: 'Books', price: 19 },
  ];

  // Combine static and generated data
  const combinedData: Product[] = [...additionalData, ...data];

  // Column definitions for MantineReactTable
  const columns: MRT_ColumnDef<Product>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      grow: true,
      mantineTableHeadCellProps: { align: 'left' },
      mantineTableBodyCellProps: { align: 'left' },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 30,
      minSize: 15,
      mantineTableHeadCellProps: { align: 'left' },
      mantineTableBodyCellProps: { align: 'left' },
    },
    {
      accessorKey: 'price',
      header: 'Price ($)',
      Cell: ({ cell }) => `$${cell.getValue()}`,
      size: 20,
      minSize: 25,
      mantineTableHeadCellProps: { align: 'right' },
      mantineTableBodyCellProps: { align: 'center' },
    },
  ];

  return (
    <SessionContainer justify='flex-start' align='center'>
      <Container size='md' w='100%'>
        <GenericMantineTable
          data={combinedData}
          columns={columns}
          options={{
            initialState: { pagination: { pageSize: 5, pageIndex: 0 }, density: 'xs' },
            mantinePaginationProps: {
              rowsPerPageOptions: ['5', '10', '20'],
              withEdges: false,
            },
            layoutMode: 'grid',
            enableSorting: true,
            paginationDisplayMode: 'pages',
            mantinePaperProps: {
              style: {
                border: 'none',
                boxShadow: 'none',
              },
            },
            enableColumnActions: false,
          }}
        />
      </Container>
    </SessionContainer>
  );
}
