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
  Stack,
  Flex,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import { Link } from '@/i18n/routing';
import classes from '@/components/common/Layout/Layout.module.scss';
import { IconLogout, IconX } from '@tabler/icons-react';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';
import { logoutAction } from '@/app/[locale]/(auth)/actions/logout-action';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';
import { useState } from 'react';
import { handleLogout } from '@/app/[locale]/(auth)/lib/handle-logout';

export const Header = ({ opened, toggle }: { opened: boolean; toggle: () => void }) => {
  const { session } = useSession();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const { hovered, ref } = useHover();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { CSRFToken } = useCSRFToken();

  return (
    <>
      <AppShell.Header>
        <SimpleGrid cols={3} h='100%' px='md'>
          {/* flex allows the control of exact position of content in the col's context*/}
          <Flex align='center' justify='flex-start'>
            {/* group adds space between items */}
            <Group wrap='nowrap'>
              <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
              <Anchor href='/about' component={Link} underline='never' c='dark'>
                <Text size='lg' fw={800}>
                  FEROZ
                </Text>
              </Anchor>
            </Group>
          </Flex>
          <Flex align='center' justify='center'>
            <Group gap={0} visibleFrom='sm' wrap='nowrap'>
              <UnstyledButton className={classes.control} component={Link} href='/about'>
                About
              </UnstyledButton>
              {/* <UnstyledButton className={classes.control} component={Link} href='/products'>                 Products
              </UnstyledButton> */}
              <UnstyledButton className={classes.control} component={Link} href='/eav-products'>
                EAV Products
              </UnstyledButton>
            </Group>
          </Flex>
          <Flex align='center' justify='flex-end'>
            {session?.user ? (
              <Avatar
                ref={ref}
                radius='lg'
                size='md'
                variant={hovered ? 'filled' : 'light'}
                onClick={(e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  openDrawer();
                }}
                component={Link}
                href='#'
                key={session?.user?.username || 'user-avatar'}
                name={session?.user?.username || 'User Avatar'}
                color='initials'
              />
            ) : (
              <Button
                component={Link}
                href='/user/login'
                variant='default'
                radius='md'
                color='gray'
                px='15'
                classNames={{ label: '!text-md !font-semibold !text-base' }}
              >
                Login
              </Button>
            )}
          </Flex>
        </SimpleGrid>
      </AppShell.Header>

      <Drawer opened={drawerOpened} onClose={closeDrawer} position='right' size='sm' withCloseButton={false} padding='md'>
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconX onClick={closeDrawer} style={{ cursor: 'pointer' }} size={20} />
        </Box>
        <Stack gap='0' align='center'>
          <Avatar radius='xl' size='xl' />
          <Text size='sm' mt='xs' mb='md' style={{ maxWidth: 200 }} title={session?.user?.name} className='truncate'>
            {session?.user?.username
              ? session.user.username.length > 50
                ? session.user.username.substring(0, 50) + '...'
                : session.user.username
              : ''}
          </Text>
        </Stack>

        <Stack gap='0'>
          {/* <Button
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
          </Button> */}
          <Divider my='xs' />
          <Button
            justify='flex-start'
            leftSection={<IconLogout size={18} />}
            color='red'
            onClick={async () =>
              await handleLogout({
                CSRFToken: CSRFToken || undefined,
                logoutAction,
                closeDrawer,
                setIsLoggingOut,
              })
            }
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

// old header that uses group and not equal width cols
// <AppShell.Header>
//         <Group h='100%' px='md' mx='auto'>
//           <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
//           <Group justify='space-between' style={{ flex: 1 }}>
//             <Anchor href='/about' component={Link} underline='never' c='dark'>
//               <Text size='lg' fw={800}>
//                 FEROZ
//               </Text>
//             </Anchor>
//             <Group ml='xl' gap={0} visibleFrom='sm'>
//               <UnstyledButton className={classes.control} component={Link} href='/about'>
//                 About
//               </UnstyledButton>
//               {/* <UnstyledButton className={classes.control} component={Link} href='/products'>
//                 Products
//               </UnstyledButton> */}
//               <UnstyledButton className={classes.control} component={Link} href='/eav-products'>
//                 EAV Products
//               </UnstyledButton>
//             </Group>
//             {session?.user ? (
//               <Avatar
//                 ref={ref}
//                 radius='lg'
//                 size='md'
//                 variant={hovered ? 'filled' : 'light'}
//                 onClick={(e: { preventDefault: () => void }) => {
//                   e.preventDefault();
//                   openDrawer();
//                 }}
//                 component={Link}
//                 href='#'
//                 key={session?.user?.username || 'user-avatar'}
//                 name={session?.user?.username || 'User Avatar'}
//                 color='initials'
//               />
//             ) : (
//               <Button
//                 component={Link}
//                 href='/user/login'
//                 variant='default'
//                 radius='md'
//                 color='gray'
//                 px='15'
//                 classNames={{ label: '!text-md !font-semibold !text-base' }}
//               >
//                 Login
//               </Button>
//             )}
//           </Group>
//         </Group>
//       </AppShell.Header>
