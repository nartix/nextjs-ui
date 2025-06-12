'use client';

import Link from 'next/link';
import { IconAlertCircle } from '@tabler/icons-react';
import { Card, Center, Stack, Title, Text, Button, useMantineTheme } from '@mantine/core';
import { ContentContainer } from '@/components/common/ui/content-container';

export default function NotFound() {
  const theme = useMantineTheme();

  return (
    <ContentContainer>
      <Center style={{ minHeight: '70vh' }}>
        <Card shadow='md' padding='xl' radius='lg' withBorder style={{ width: '100%', maxWidth: 400 }}>
          <Stack align='center' gap='md'>
            <IconAlertCircle size={48} strokeWidth={1.5} color={theme.colors.red[6]} />
            <Title order={2} ta='center' c='red.7'>
              404 — Page Not Found
            </Title>
            <Text size='sm' ta='center' c='dimmed'>
              Sorry, we couldn’t find the page you’re looking for.
            </Text>
            <Button component={Link} href='/' fullWidth>
              Go to Homepage
            </Button>
          </Stack>
        </Card>
      </Center>
    </ContentContainer>
  );
}
