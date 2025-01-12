import { AppShell, Burger, Group, UnstyledButton, Text, RemoveScroll } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Layout.module.css';
import { LoginIcon } from '../Icons/LoginIcon';
// import { Footer } from '../../../components/common/Footer';
import { Footer } from '../Footer/Footer';

const lorem =
  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <AppShell
      header={{ height: 60, collapsed: opened ? false : !pinned, offset: true }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding='md'
    >
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Group justify='space-between' style={{ flex: 1 }}>
            <MantineLogo size={30} />
            <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Home</UnstyledButton>
              <UnstyledButton className={classes.control}>Blog</UnstyledButton>
              <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
              <UnstyledButton className={classes.control}>Support</UnstyledButton>
            </Group>
            <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Login</UnstyledButton>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py='md' px={4}>
        <UnstyledButton className={classes.control}>Home</UnstyledButton>
        <UnstyledButton className={classes.control}>Blog</UnstyledButton>
        <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
        <UnstyledButton className={classes.control}>Support</UnstyledButton>
      </AppShell.Navbar>

      <AppShell.Main>
        <RemoveScroll enabled={opened}>
          {Array(2)
            .fill(0)
            .map((_, index) => (
              <Text size='lg' key={index} my='md' maw={600} mx='auto'>
                {lorem}
              </Text>
            ))}
        </RemoveScroll>
      </AppShell.Main>
      <Footer />
    </AppShell>
  );
}
