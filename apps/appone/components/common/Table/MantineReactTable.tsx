'use client';

import React from 'react';
import {
  MantineReactTable,
  // MRT_Icons,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
} from 'mantine-react-table';

// const customSortIcons: Partial<MRT_Icons> = {
//   IconArrowsSort: () => null,
// };

interface GenericMantineTableProps<T extends object> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  options?: Partial<MRT_TableOptions<T>>;
}

function GenericMantineTable<T extends object>({ data, columns, options = {} }: GenericMantineTableProps<T>) {
  const table = useMantineReactTable<T>({
    data,
    columns,
    ...options,
  });

  return <MantineReactTable table={table} />;
}

export { GenericMantineTable };

// 'use client';

// import React, { useState } from 'react';
// import {
//   MantineReactTable,
//   useMantineReactTable,
//   type MRT_ColumnDef,
//   type MRT_TableOptions,
//   type MRT_Header,
//   MRT_Column,
//   MRT_Icons,
// } from 'mantine-react-table';
// import { ActionIcon } from '@mantine/core';
// import { IconArrowsSort, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

// interface GenericMantineTableProps<T extends Record<string, any>> {
//   data: T[];
//   columns: MRT_ColumnDef<T>[];
//   options?: Partial<MRT_TableOptions<T>>;
//   showSortIconOnClickOnly?: boolean;
// }

// const customSortIcons: Partial<MRT_Icons> = {
//   IconArrowsSort: () => null,
// };

// function GenericMantineTable<T extends Record<string, any>>({
//   data,
//   columns,
//   options = {},
//   showSortIconOnClickOnly = false,
// }: GenericMantineTableProps<T>) {
//   const [activeSortColumn, setActiveSortColumn] = useState<string | null>(null);

//   const enhancedColumns: MRT_ColumnDef<T>[] = columns.map((col) => ({
//     ...col,
//     Header: ({ column }: { column: MRT_Column<T, unknown> }) => (
//       <div
//         style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
//         onClick={() => {
//           column.toggleSorting();
//           setActiveSortColumn(column.id);
//         }}
//       >
//         {/* {column.columnDef.header as React.ReactNode} */}
//         {/* {showSortIconOnClickOnly &&
//           activeSortColumn === column.id &&
//           (column.getIsSorted() ? (
//             column.getIsSorted() === 'asc' ? (
//               <IconSortAscending size={16} />
//             ) : (
//               <IconSortDescending size={16} />
//             )
//           ) : (
//             <IconArrowsSort size={16} />
//           ))} */}
//       </div>
//     ),
//   }));

//   const table = useMantineReactTable<T>({
//     data,
//     icons: customSortIcons,
//     columns: showSortIconOnClickOnly ? enhancedColumns : columns,
//     ...options,
//   });

//   return <MantineReactTable table={table} />;
// }

// export { GenericMantineTable };

// 'use client';

// import React, { useState } from 'react';
// import {
//   MantineReactTable,
//   useMantineReactTable,
//   type MRT_ColumnDef,
//   type MRT_TableOptions,
//   type MRT_Column,
// } from 'mantine-react-table';
// import { IconArrowsSort, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

// interface GenericMantineTableProps<T extends Record<string, any>> {
//   data: T[];
//   columns: MRT_ColumnDef<T>[];
//   options?: Partial<MRT_TableOptions<T>>;
//   showSortIconOnClickOnly?: boolean;
// }

// function GenericMantineTable<T extends Record<string, any>>({
//   data,
//   columns,
//   options = {},
//   showSortIconOnClickOnly = false,
// }: GenericMantineTableProps<T>) {
//   const [activeSortColumn, setActiveSortColumn] = useState<string | null>(null);

//   const enhancedColumns: MRT_ColumnDef<T>[] = columns.map((col) => ({
//     ...col,
//     Icons: null,
//     Header: ({ column }: { column: MRT_Column<T, unknown> }) => {
//       const isActive = activeSortColumn === column.id;
//       const sortDirection = column.getIsSorted();

//       return <>{column.columnDef.header as React.ReactNode}</>;
//     },
//   }));

//   const table = useMantineReactTable<T>({
//     data,
//     columns: showSortIconOnClickOnly ? enhancedColumns : columns,
//     ...options,
//   });

//   return <MantineReactTable table={table} />;
// }

// export { GenericMantineTable };
