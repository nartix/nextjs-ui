import React from 'react';
import { Anchor, Card, Center, Container, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { IconBrandNpm, IconBrandGithub, IconBrandMantine, IconShieldLock, IconForms, IconCode } from '@tabler/icons-react';
// import { Link } from '@/i18n/routing';

export function AboutContent() {
  return (
    <Container size='md' py='lg' px={0}>
      <Stack gap='md'>
        <Title order={3} ta='center' mb='sm'>
          <Anchor href='https://github.com/nartix/nextjs-ui' fw={600} fz='xl' target='_blank' underline='never'>
            <Center inline>
              <Group gap={4}>
                About this Next.js UI Project
                <IconBrandGithub size={20} />
              </Group>
            </Center>
          </Anchor>
        </Title>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Text size='md'>
            This project uses <b>Next.js</b> for a product catalog, designed with the <b>Entity Attribute Value (EAV)</b>{' '}
            model—perfect for flexible, dynamic product attributes. The API is built using <b>Spring Boot</b>. Authentication and
            authorization are handled by my own custom monorepo package.
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
            <Title order={5}>
              <Anchor
                href='https://github.com/nartix/nextjs-ui/tree/main/packages/next-security'
                underline='never'
                target='_blank'
                fw={600}
              >
                Next Security
              </Anchor>
            </Title>
          </Group>
          <Text size='md'>
            My <b>Next Security</b> package is inspired by NextAuth.js but supports <b>database sessions</b> for credential-based
            authentication instead of JWT.
          </Text>
        </Card>

        <Card shadow='sm' padding='md' radius='md' withBorder>
          <Group gap='xs' mb={4}>
            <IconShieldLock size={20} />
            <Title order={5}>
              <Anchor
                href='https://github.com/nartix/nextjs-ui/tree/main/packages/next-csrf'
                target='_blank'
                underline='never'
                fw={600}
              >
                Next CSRF
              </Anchor>
            </Title>
            <Anchor
              href='https://www.npmjs.com/package/@nartix/next-csrf'
              target='_blank'
              ml='auto'
              underline='always'
              size='sm'
              c='blue'
            >
              <Group gap={2}>
                <IconBrandNpm size={30} />
              </Group>
            </Anchor>
          </Group>
          <Text size='md'>
            <b>Next-CSRF</b> is my package for CSRF protection in Next.js. It handles CSRF token generation and validation and is
            available as an npm package.
          </Text>
        </Card>

        <Card shadow='sm' padding='md' radius='md' withBorder>
          <Group gap='xs' mb={4}>
            <IconForms size={20} />
            <Title order={5}>
              <Anchor
                href='https://github.com/nartix/nextjs-ui/tree/main/packages/mantine-form-builder'
                target='_blank'
                underline='never'
                fw={600}
              >
                Mantine Form Builder
              </Anchor>
            </Title>
          </Group>
          <Text size='md'>
            <b>Mantine Form Builder</b> helps you build forms with MantineJS, Zod for validation, and React Hook Form for state
            management.
          </Text>
        </Card>

        <Card shadow='sm' padding='md' radius='md' withBorder>
          <Group gap='xs' mb={4}>
            <IconCode size={20} />
            <Title order={5}>
              <Anchor
                href='https://www.npmjs.com/package/@nartix/next-middleware-chain'
                target='_blank'
                underline='never'
                fw={600}
              >
                Next Middleware Chain
              </Anchor>
            </Title>
            <Anchor
              href='https://github.com/nartix/nextjs-ui/tree/main/packages/next-middleware-chain'
              target='_blank'
              underline='always'
              ml='auto'
            >
              <Group gap={2}>
                <IconBrandNpm size={30} />
              </Group>
            </Anchor>
          </Group>
          <Text size='md'>
            <b>Next Middleware Chain</b> lets you compose and chain multiple middleware functions for Next.js—perfect for complex
            authentication, authorization, and more.
          </Text>
        </Card>

        <Card shadow='sm' padding='md' radius='md' withBorder>
          <Group gap='xs' mb={4}>
            <IconCode size={20} />
            <Title order={5}>
              <Anchor
                href='https://github.com/nartix/spring-boot-api/tree/main/src/main/java/com/ferozfaiz/common/tree'
                target='_blank'
                underline='never'
                fw={600}
              >
                Spring Boot – Materialized Path Hierarchy
              </Anchor>
            </Title>
          </Group>
          <Text size='md'>
            I implemented and used a <b>materialized‐path</b> data hierarchy for product categories in the Spring Boot API to
            enable efficient tree operations and fast ancestor/descendant queries. The API also uses the{' '}
            <b>Entity Attribute Value (EAV)</b> model to serve flexible product data.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
