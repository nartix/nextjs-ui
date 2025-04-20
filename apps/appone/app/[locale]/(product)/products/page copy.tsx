import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Table, Text, Title, TableTd, TableTr, TableTh, TableTbody, TableThead, Container } from '@mantine/core';
// import { DataTable } from '@/components/common/Table/DataTable';
import { DataTable } from '@/components/common/Table/TanstackTable';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
};

export default async function Products() {
  const session = await getServerSession();
  const user = session?.user;

  const t = await getTranslations('HomePage');

  const elements = [
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
  ];

  const elements2 = [
    [6, 'Carbon', 'C', 12.011],
    [7, 'Nitrogen', 'N', 14.007],
    [39, 'Yttrium', 'Y', 88.906],
    [56, 'Barium', 'Ba', 137.33],
    [58, 'Cerium', 'Ce', 140.12],
  ];

  const rows = elements.map((element) => (
    <TableTr key={element.position}>
      <TableTd>{element.position}</TableTd>
      <TableTd>{element.name}</TableTd>
      <TableTd>{element.symbol}</TableTd>
      <TableTd className='text-center'>{element.mass}</TableTd>
    </TableTr>
  ));

  const columnHelper = createColumnHelper<Person>();

  const additionalData: Person[] = Array.from({ length: 20 }, (_, i) => ({
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    age: 20 + i,
    visits: (i + 1) * 10,
    status: i % 3 === 0 ? 'Single' : i % 3 === 1 ? 'In Relationship' : 'Complicated',
    progress: (i + 1) * 4,
  }));

  const columns = [
    columnHelper.accessor('firstName', {
      header: 'First Name',
    }),
    columnHelper.accessor('lastName', {
      header: 'Last Name',
    }),
    columnHelper.accessor('age', {
      header: 'Age',
    }),
    columnHelper.accessor('visits', {
      header: 'Visits',
    }),
  ];

  const data: Person[] = [
    { firstName: 'John', lastName: 'Doe', age: 28, visits: 100 },
    { firstName: 'Jane', lastName: 'Smith', age: 32, visits: 150 },
    // additional data...
  ];

  const combinedData: Person[] = [...additionalData, ...data];

  return (
    <SessionContainer justify='flex-start' align='center'>
      <Container size='md' w='100%'>
        <DataTable data={combinedData} columns={columns as unknown as ColumnDef<Person>[]} pageSize={2} />
      </Container>
    </SessionContainer>
  );
  // return (
  //   <SessionContainer justify='flex-start' align='center'>
  //     <Container size='md' w='100%'>
  //       <DataTable head={['Position', 'Name', 'Symbol', 'Mass']} body={elements2} />
  //     </Container>
  //   </SessionContainer>
  // );
}
