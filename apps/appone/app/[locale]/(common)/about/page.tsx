import React from 'react';
// import { getTranslations } from 'next-intl/server';
// import { getServerSession } from '@/app/[locale]/(auth)/get-server-session';
import { SessionContainer } from '@/components/common/SessionContainer/SessionContainer';
import { Anchor, Card, Container, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconBrandNpm, IconBrandMantine, IconShieldLock, IconForms, IconCode, IconLink } from '@tabler/icons-react';

export default async function About() {
  const lorem =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?';

  return (
    <SessionContainer justify='flex-start' align='center' pt='lg' direction='column'>
      <Container size='md' py='lg' px={0}>
        <Stack gap='md'>
          <Title order={3} ta='center' mb='sm'>
            About this Next.js Project
          </Title>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Text size='md'>
              This project uses <b>Next.js</b> for a product catalog, designed with the <b>Entity Attribute Value (EAV)</b>{' '}
              model—perfect for flexible, dynamic product attributes. The API is built using <b>Spring Boot</b>. Authentication
              and authorization are handled by my own custom monorepo package.
            </Text>
          </Card>

          <Divider label='Key Packages' labelPosition='center' />

          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Group gap='xs' mb={4}>
              <IconBrandMantine size={20} />
              <Title order={5}>MantineJS</Title>
            </Group>
            <Text size='md'>
              UI components are powered by <b>MantineJS</b>.
            </Text>
          </Card>

          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Group gap='xs' mb={4}>
              <IconShieldLock size={20} />
              <Title order={5}>Next Security</Title>
            </Group>
            <Text size='md'>
              My <b>Next Security</b> package is inspired by NextAuth.js but supports <b>database sessions</b> for
              credential-based authentication instead of JWT.
            </Text>
          </Card>

          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Group gap='xs' mb={4}>
              <IconShieldLock size={20} />
              <Title order={5}>Next CSRF</Title>
              <Anchor
                href='https://www.npmjs.com/package/@nartix/next-csrf'
                target='_blank'
                ml='auto'
                underline='always'
                size='sm'
                c='blue'
              >
                <Group gap={2}>
                  <IconBrandNpm size={18} />
                  npm
                </Group>
              </Anchor>
            </Group>
            <Text size='md'>
              <b>Next-CSRF</b> is my package for CSRF protection in Next.js. It handles CSRF token generation and validation and
              is available as an npm package.
            </Text>
          </Card>

          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Group gap='xs' mb={4}>
              <IconForms size={20} />
              <Title order={5}>Mantine Form Builder</Title>
              <Anchor
                href='https://www.npmjs.com/package/@nartix/mantine-form-builder'
                target='_blank'
                ml='auto'
                underline='always'
                size='sm'
                c='blue'
              >
                <Group gap={2}>
                  <IconBrandNpm size={18} />
                  npm
                </Group>
              </Anchor>
            </Group>
            <Text size='md'>
              <b>Mantine Form Builder</b> helps you build forms with MantineJS, Zod for validation, and React Hook Form for state
              management.
            </Text>
          </Card>

          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Group gap='xs' mb={4}>
              <IconCode size={20} />
              <Title order={5}>Next Middleware Chain</Title>
            </Group>
            <Text size='md'>
              <b>Next Middleware Chain</b> lets you compose and chain multiple middleware functions for Next.js—perfect for
              complex authentication, authorization, and more.
            </Text>
          </Card>
        </Stack>
      </Container>
    </SessionContainer>
  );
}
