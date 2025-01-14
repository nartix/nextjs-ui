import { AppShell, Burger, Group, UnstyledButton, Text, RemoveScroll, Avatar } from '@mantine/core';
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
      // footer={{ offset: opened ? false : true, height: { base: 90, md: 70, lg: 70 }, collapsed: opened ? false : !pinned }}
      // aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding='md'
    >
      <AppShell.Header>
        <Group h='100%' px='md' mx='auto'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Group justify='space-between' style={{ flex: 1 }}>
            <Text size='lg' fw={700} variant='gradient' gradient={{ from: 'gray', to: 'rgba(120, 73, 73, 1)', deg: 90 }}>
              FEROZ
            </Text>
            <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Home</UnstyledButton>
              <UnstyledButton className={classes.control}>Blog</UnstyledButton>
              <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
              <UnstyledButton className={classes.control}>Support</UnstyledButton>
            </Group>
            {/* <Group ml='xl' gap={0} visibleFrom='sm'>
              <UnstyledButton className={classes.control}>Login</UnstyledButton>
            </Group> */}
            <Avatar radius='xl' size='md' />
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
              <Text size='lg' key={index} my='md' mx='auto' className='max-w-2xl'>
                {lorem}
              </Text>
            ))}
        </RemoveScroll>
      </AppShell.Main>
      {/* <AppShell.Aside p='md'>Aside</AppShell.Aside> */}
      <Footer />
    </AppShell>
  );
}
