import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Container } from '@mantine/core';
import { GenericMantineTable } from '@/components/common/Table/MantineReactTable';
import { type MRT_ColumnDef } from 'mantine-react-table';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

export default async function Products() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('HomePage');

  const additionalData: Person[] = Array.from({ length: 20 }, (_, i) => ({
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    age: 20 + i,
    visits: (i + 1) * 10,
    status: i % 3 === 0 ? 'Single' : i % 3 === 1 ? 'In Relationship' : 'Complicated',
    progress: (i + 1) * 4,
  }));

  const data: Person[] = [
    { firstName: 'JohnJonJonJONONN', lastName: 'Doe', age: 28, visits: 100, status: 'Single', progress: 80 },
    { firstName: 'Jane', lastName: 'Smith', age: 32, visits: 150, status: 'In Relationship', progress: 90 },
    // additional data...
  ];

  const combinedData: Person[] = [...additionalData, ...data];

  const columns: MRT_ColumnDef<Person>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'age',
      header: 'Age',
    },
    {
      accessorKey: 'visits',
      header: 'Visits',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'progress',
      header: 'Profile Progress',
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
            mantineTableContainerProps: {
              style: {
                // overflowY: 'auto',
                overflowX: 'auto',
              },
            },
            defaultColumn: {
              size: 40,
            },
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
