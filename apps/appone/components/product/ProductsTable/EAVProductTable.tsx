'use client';

import React, { useMemo } from 'react';
import { GenericMantineTable } from '@/components/common/Table/MantineReactTable';
import type { MRT_ColumnDef } from 'mantine-react-table';

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
    year: string;
    color: string;
  };
}

type AttributeValue = string | number;

type AttributesMap = Record<string, AttributeValue>;

interface ProductWithMap extends Product {
  attributesMap: AttributesMap;
}

export function EAVProductsTable({ data, translations }: ProductsTableProps) {
  const dataWithMaps: ProductWithMap[] = useMemo(() => {
    return data.map((prod) => {
      const map: AttributesMap = {};
      for (const attr of prod.attributes ?? []) {
        if (attr.attributeName) {
          map[attr.attributeName.toLowerCase()] = attr.attributeValueNumeric ?? attr.attributeValueString ?? '';
        }
      }
      return { ...prod, attributesMap: map };
    });
  }, [data]);

  const columns: MRT_ColumnDef<ProductWithMap>[] = [
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
      accessorFn: (row) => row.attributesMap['year'] ?? '',
      mantineTableHeadCellProps: { align: 'left' },
      mantineTableBodyCellProps: { align: 'left' },
      grow: false,
      size: 60,
    },
    {
      id: 'color',
      header: translations.color,
      accessorFn: (row) => row.attributesMap['color'] ?? '',
      mantineTableHeadCellProps: { align: 'left' },
      mantineTableBodyCellProps: { align: 'left' },
      grow: false,
      size: 65,
    },
  ];

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

  return <GenericMantineTable<ProductWithMap> data={dataWithMaps} columns={columns} options={options} />;
}
