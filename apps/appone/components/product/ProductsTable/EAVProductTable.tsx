'use client';

import React, { useMemo } from 'react';
import { GenericMantineTable } from '@/components/common/Table/MantineReactTable';
import type { MRT_ColumnDef } from 'mantine-react-table';

// Update the Product type to match your new API data if not already
export interface ProductAttribute {
  attributeName: string;
  attributeValueNumeric: number | null;
  attributeValueString: string | null;
  measurementUnit: string | null;
}
export interface Product {
  id: number;
  name: string;
  price: number;
  brand: string | null;
  manufacturer: string | null;
  attributes: ProductAttribute[];
}

interface ProductsTableProps {
  data: Product[];
  translations: {
    name: string;
    brand: string;
    manufacturer: string;
    price: string;
    year: string; // translation for dynamic attribute, e.g. 'Year'
    color: string; // translation for dynamic attribute, e.g. 'Color'
    // add other attribute translations as needed
  };
}

export function EAVProductsTable({ data, translations }: ProductsTableProps) {
  // Helper to get attribute value by name
  const getAttributeValue = (attributes: ProductAttribute[], name: string) => {
    const attr = attributes.find((a) => a.attributeName.toLowerCase() === name.toLowerCase());
    return attr ? (attr.attributeValueNumeric !== null ? attr.attributeValueNumeric : attr.attributeValueString) : '';
  };

  // Define columns, including dynamic attributes
  const columns: MRT_ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: translations.name,
        mantineTableHeadCellProps: {
          align: 'left',
        },
        mantineTableBodyCellProps: {
          align: 'left',
        },
        size: 375,
        minSize: 150,
      },
      {
        accessorKey: 'price',
        header: translations.price,
        Cell: ({ cell }) =>
          cell.getValue<number>()?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }),
        mantineTableHeadCellProps: {
          align: 'left',
        },
        mantineTableBodyCellProps: { align: 'left' },
        grow: false,
        size: 65,
      },
      {
        accessorKey: 'brand',
        header: translations.brand,
        mantineTableHeadCellProps: { align: 'left' },
        mantineTableBodyCellProps: { align: 'left' },
        grow: false,
        size: 65,
      },
      {
        id: 'year',
        header: translations.year,
        accessorFn: (row) => getAttributeValue(row.attributes, 'Year'),
        mantineTableHeadCellProps: { align: 'left' },
        mantineTableBodyCellProps: { align: 'left' },
        grow: false,
        size: 60,
      },
      {
        id: 'color',
        header: translations.color,
        accessorFn: (row) => getAttributeValue(row.attributes, 'Color'),
        mantineTableHeadCellProps: { align: 'left' },
        mantineTableBodyCellProps: { align: 'left' },
        grow: false,
        size: 65,
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
      mantinePaperProps: {
        style: { border: 'none', boxShadow: 'none' },
      },
      mantineTableHeadCellProps: {
        style: { whiteSpace: 'normal', paddingLeft: 2, paddingRight: 0, paddingTop: 4, paddingBottom: 4 }, // Note: no "!important" needed with `sx`
      },
      mantineTableBodyCellProps: {
        style: { whiteSpace: 'normal', paddingLeft: 2, paddingRight: 0, paddingTop: 4, paddingBottom: 4 },
      },
      enableColumnActions: false,
      // disable fuzzy global search
      globalFilterFn: 'includesString', // Exact substring match, case‐insensitive by default
      enableGlobalFilterModes: false, // Hide any filter mode dropdown
      enableGlobalFilterRankedResults: false,
    }),
    []
  );

  return <GenericMantineTable data={data} columns={columns} options={options} />;
}
