'use client';

import { IconAlertCircle } from '@tabler/icons-react';
import { Card, Title, Text, Button, Center, Stack, useMantineTheme } from '@mantine/core';
import { ContentContainer } from '@/components/common/ui/content-container';

export function ApplicationError({ error, reset }: { error: Error; reset: () => void }) {
  const theme = useMantineTheme();

  return (
    <ContentContainer>
      <Center style={{ minHeight: '70vh' }}>
        <Card shadow='md' padding='xl' radius='lg' withBorder style={{ width: '100%', maxWidth: 400 }}>
          <Stack align='center' gap='md'>
            <IconAlertCircle size={48} strokeWidth={1.5} color={theme.colors.red[6]} />
            <Title order={2} ta='center' c='red.7'>
              Oops! Something went wrong
            </Title>
            <Text size='sm' ta='center' c='dimmed'>
              {error.message}
            </Text>
            <Button fullWidth onClick={reset}>
              Reload
            </Button>
          </Stack>
        </Card>
      </Center>
    </ContentContainer>
  );
}
