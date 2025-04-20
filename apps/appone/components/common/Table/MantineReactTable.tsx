'use client';

import React from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_TableOptions } from 'mantine-react-table';

interface GenericMantineTableProps<T extends Record<string, any>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  options?: Partial<MRT_TableOptions<T>>;
}

function GenericMantineTable<T extends Record<string, any>>({ data, columns, options = {} }: GenericMantineTableProps<T>) {
  const table = useMantineReactTable<T>({
    data,
    columns,
    ...options,
  });

  return <MantineReactTable table={table} />;
}

export { GenericMantineTable };
