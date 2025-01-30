import React from 'react';
import { FormTest } from '@/components/common/FormTest/FormTest';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Container } from '@mantine/core';

export default async function TestLogin() {
  return (
    <SessionContainer>
      <Container w='100%' size={400} mt='lg'>
        <FormTest />
      </Container>
    </SessionContainer>
  );
}
