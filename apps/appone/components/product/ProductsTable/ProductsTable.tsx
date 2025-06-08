'use client';

import React, { useMemo } from 'react';
import { GenericMantineTable } from '@/components/common/Table/MantineReactTable';
import type { MRT_ColumnDef } from 'mantine-react-table';
import { type Product } from '@/types';

interface ProductsTableProps {
  data: Product[];
  translations: {
    title: string;
    category: string;
    price: string;
  };
}

export function ProductsTable({ data, translations }: ProductsTableProps) {
  const columns: MRT_ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: translations.title,
        grow: true,
        mantineTableHeadCellProps: { align: 'left' },
        mantineTableBodyCellProps: { align: 'left' },
      },
      {
        accessorKey: 'category',
        header: translations.category,
        size: 30,
        minSize: 15,
        mantineTableHeadCellProps: { align: 'left' },
        mantineTableBodyCellProps: { align: 'left' },
      },
      {
        accessorKey: 'price',
        header: translations.price + ' ($)',
        Cell: ({ cell }) => (
          <>
            {cell.getValue<number>()?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </>
        ),
        size: 20,
        minSize: 25,
        mantineTableHeadCellProps: { align: 'right' },
        mantineTableBodyCellProps: { align: 'center' },
      },
    ],
    [translations]
  );

  const options = useMemo(
    () => ({
      initialState: { pagination: { pageSize: 5, pageIndex: 0 }, density: 'xs' as const },
      mantinePaginationProps: {
        rowsPerPageOptions: ['5', '10', '20'],
        withEdges: false,
      },
      layoutMode: 'grid' as const,
      enableSorting: true,
      paginationDisplayMode: 'pages' as const,
      mantinePaperProps: { style: { border: 'none', boxShadow: 'none' } },
      enableColumnActions: false,
    }),
    []
  );

  return <GenericMantineTable data={data} columns={columns} options={options} />;
}
