import { Anchor, AppShell, Burger, Group, Text, UnstyledButton, Avatar } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { Link } from '@/i18n/routing';
import classes from '@/components/common/Layout/Layout.module.scss';

export const Header = ({ opened, toggle }: { opened: boolean; toggle: () => void }) => {
  const { hovered, ref } = useHover();
  return (
    <AppShell.Header>
      <Group h='100%' px='md' mx='auto'>
        <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
        <Group justify='space-between' style={{ flex: 1 }}>
          <Anchor href='/' component={Link}>
            <Text size='lg' fw={700} variant='gradient' gradient={{ from: 'gray', to: 'rgba(120, 73, 73, 1)', deg: 90 }}>
              FEROZ
            </Text>
          </Anchor>
          <Group ml='xl' gap={0} visibleFrom='sm'>
            <UnstyledButton className={classes.control} component={Link} href='/'>
              Home
            </UnstyledButton>
            <UnstyledButton className={classes.control}>Blog</UnstyledButton>
            <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
            <UnstyledButton className={classes.control}>Support</UnstyledButton>
            <UnstyledButton className={classes.control} component={Link} href='/formtest'>
              FormTest
            </UnstyledButton>
          </Group>
          {/* <Group ml='xl' gap={0} visibleFrom='sm'>
          <UnstyledButton className={classes.control}>Login</UnstyledButton>
        </Group> */}

          <Avatar ref={ref} radius='xl' size='md' component={Link} variant={hovered ? 'filled' : 'light'} href='/login' />
        </Group>
      </Group>
    </AppShell.Header>
  );
};
