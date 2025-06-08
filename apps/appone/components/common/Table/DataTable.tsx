'use client';

import { Table, TableTd, TableTr, TableTh, TableTbody, TableThead } from '@mantine/core';

interface DataTableProps {
  head: (string | number)[];
  body: (string | number)[][];
  footer?: (string | number)[];
}

export function DataTable({ head, body }: DataTableProps) {
  const headRows = head.map((data) => {
    return <TableTh key={data as string}>{data as string}</TableTh>;
  });

  const bodyRows = body.map((row, rowIndex) => (
    <TableTr key={rowIndex}>
      {row.map((cell, cellIndex) => (
        <TableTd key={cellIndex}>{cell}</TableTd>
      ))}
    </TableTr>
  ));

  return (
    <Table highlightOnHover>
      <TableThead>
        <TableTr>{headRows}</TableTr>
      </TableThead>
      <TableTbody>{bodyRows}</TableTbody>
    </Table>
  );
}
