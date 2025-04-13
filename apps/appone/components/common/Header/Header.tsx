import {
  Anchor,
  AppShell,
  Burger,
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Drawer,
  Box,
  Divider,
  Button,
  List,
  ThemeIcon,
  Stack,
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import { Link } from '@/i18n/routing';
import classes from '@/components/common/Layout/Layout.module.scss';
import { IconLogout, IconSettings, IconUser, IconX } from '@tabler/icons-react';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';
import { logoutAction } from '@/app/[locale]/(auth)/actions/logout-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { useState } from 'react';

export const Header = ({ opened, toggle }: { opened: boolean; toggle: () => void }) => {
  const { session } = useSession();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const { hovered, ref } = useHover();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { CSRFToken } = useCSRFToken();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const formData = new FormData();
      formData.append('csrf_token', CSRFToken || '');
      await logoutAction(formData);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      closeDrawer();
    }
  };
  return (
    <>
      <AppShell.Header>
        <Group h='100%' px='md' mx='auto'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Group justify='space-between' style={{ flex: 1 }}>
            <Anchor href='/' component={Link}>
              <Text size='lg' fw={700}>
                FEROZ
              </Text>
            </Anchor>
            <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control} component={Link} href='/'>
                Home
              </UnstyledButton>
              <UnstyledButton className={classes.control} component={Link} href='/products'>
                Products
              </UnstyledButton>
              <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
              <UnstyledButton className={classes.control}>Support</UnstyledButton>
              <UnstyledButton className={classes.control} component={Link} href='/formtest'>
                FormTest
              </UnstyledButton>
            </Group>
            <Avatar
              component={Link}
              href={session?.user ? '#' : '/user/login'}
              ref={ref}
              radius='lg'
              size='md'
              variant={hovered ? 'filled' : 'light'}
              onClick={(event) => {
                if (session?.user) {
                  event.preventDefault();
                  openDrawer();
                }
              }}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <Drawer opened={drawerOpened} onClose={closeDrawer} position='right' size='sm' withCloseButton={false} padding='md'>
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconX onClick={closeDrawer} style={{ cursor: 'pointer' }} size={20} />
        </Box>

        <Group p='md' justify='center'>
          <Avatar radius='xl' size='xl' src='/path-to-user-avatar.png' />
        </Group>

        <Stack gap='0'>
          <Button
            justify='flex-start'
            leftSection={<IconUser size={18} />}
            component={Link}
            href='/profile'
            bd='0'
            variant='default'
            fullWidth
          >
            My Profile
          </Button>
          <Button
            justify='flex-start'
            leftSection={<IconSettings size={18} />}
            component={Link}
            href='/settings'
            bd='0'
            variant='default'
            fullWidth
          >
            Settings
          </Button>
          <Divider my='xs' />
          <Button
            justify='flex-start'
            leftSection={<IconLogout size={18} />}
            color='red'
            onClick={async () => await handleLogout()}
            variant='subtle'
            disabled={isLoggingOut}
            fullWidth
          >
            Logout
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

function VerticalMenu() {
  const handleLogout = () => {
    // Logout logic here
    console.log('Logout logic here');
  };

  return (
    <Box>
      <List
        spacing='sm'
        size='sm'
        icon={
          <ThemeIcon color='blue' size={24} radius='xl'>
            <IconUser size={16} />
          </ThemeIcon>
        }
      >
        <List.Item>
          <Anchor component={Link} href='/settings'>
            My Profile
          </Anchor>
        </List.Item>
      </List>

      <List
        spacing='sm'
        size='sm'
        icon={
          <ThemeIcon color='green' size={24} radius='xl'>
            <IconSettings size={16} />
          </ThemeIcon>
        }
      >
        <List.Item>
          <Anchor component={Link} href='/settings'>
            Settings
          </Anchor>
        </List.Item>
      </List>

      <Divider my='sm' />

      <List
        spacing='sm'
        size='sm'
        icon={
          <ThemeIcon color='red' size={24} radius='xl'>
            <IconLogout size={16} />
          </ThemeIcon>
        }
      >
        <List.Item onClick={handleLogout}>Logout</List.Item>
      </List>
    </Box>
  );
}
