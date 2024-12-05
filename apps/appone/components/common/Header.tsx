'use client';
import { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  // Link,
  Button,
} from '@nextui-org/react';

import Link from '@/components/common/ui/link';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';
import { logoutAction } from '@/app/[locale]/(auth)/actions/logout-action';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const session = useSession();
  const user = session?.user || null;

  console.log('Header rendered');

  const menuItems = [
    'Profile',
    'Dashboard',
    'Activity',
    'Analytics',
    'System',
    'Deployments',
    'My Settings',
    'Team Settings',
    'Help & Feedback',
    'Log Out',
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className='bg-[#f6f8fa]'>
      <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className='sm:hidden' />
        <NavbarBrand>
          <Link href='/'>
            <p className='font-bold text-inherit'>ACME</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        <NavbarItem>
          <Link color='foreground' href='#'>
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href='#' aria-current='page'>
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color='foreground' href='#'>
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify='end'>
        {user ? (
          <NavbarItem>
            <form action={logoutAction}>
              <Button color='primary' variant='flat' type='submit'>
                Logout
              </Button>
            </form>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem className='hidden lg:flex'>
              <Link href='/login'>Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color='primary' href='/signup' variant='flat'>
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={index === 2 ? 'primary' : index === menuItems.length - 1 ? 'danger' : 'foreground'}
              className='w-full'
              href='#'
              size='lg'
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
