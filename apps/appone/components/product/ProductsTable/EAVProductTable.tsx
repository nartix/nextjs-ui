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

// 1. Define a reusable alias for your attribute values
type AttributeValue = string | number;

// 2. Map string keys to only those value types
type AttributesMap = Record<string, AttributeValue>;

// 3. Extend your Product to carry that map
interface ProductWithMap extends Product {
  attributesMap: AttributesMap;
}

export function EAVProductsTable({ data, translations }: ProductsTableProps) {
  // Helper to get attribute value by name.
  // Now safely handles null/undefined 'attributes' or 'attributeName'.
  // const getAttributeValue = (attributes: ProductAttribute[] | null | undefined, name: string): string | number => {
  //   // 1) If there's no attributes array, bail out early
  //   if (!attributes?.length) return '';

  //   // 2) Safe lookup with optional‐chaining
  //   const attr = attributes.find((a) => a.attributeName?.toLowerCase() === name.toLowerCase());

  //   // 3) If found, pick numeric over string; if still nullish, return empty string
  //   if (attr) {
  //     return attr.attributeValueNumeric ?? attr.attributeValueString ?? '';
  //   }
  //   return '';
  // };

  // 4. Build your data once, in a useMemo, typing it explicitly
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

  // Define columns, including dynamic attributes
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
