'use client';

import React from 'react';
import { Table, Button, Group, Container } from '@mantine/core';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
}

export function DataTable<T>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableSorting: true,
  });

  return (
    <Container className='p-2'>
      <Table className='w-full table-auto'>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th key={header.id}>
                  <div
                    {...{
                      style: header.column.getCanSort() ? { cursor: 'pointer', userSelect: 'none' } : {},
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Group justify='center' gap='xs' mt='md'>
        <Button variant='outline' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          {'<<'}
        </Button>
        <Button variant='outline' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {'<'}
        </Button>

        {Array.from({ length: table.getPageCount() }, (_, i) => (
          <Button
            key={i}
            variant={table.getState().pagination.pageIndex === i ? 'filled' : 'outline'}
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </Button>
        ))}

        <Button variant='outline' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {'>'}
        </Button>
        <Button variant='outline' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
          {'>>'}
        </Button>
      </Group>
    </Container>
  );
}
