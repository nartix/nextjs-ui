'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@nextui-org/react';

import { Link } from '@/components/common/ui/link';
import { useSession } from '@/app/[locale]/(auth)/context/session-context';
import { logoutAction } from '@/app/[locale]/(auth)/actions/logout-action';
// import { Link as IntlLink } from '@/i18n/routing';
import { useCSRFToken } from '@/app/[locale]/(common)/context/csrf-context';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const session = useSession();
  const user = session?.user || null;
  const router = useRouter();
  const csrfToken = useCSRFToken() || '';

  const menuItems = [
    { label: 'Profile', href: '/test' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Activity', href: '/activity' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'System', href: '/system' },
    user
      ? {
          label: 'Log Out',
          href: '/',
          action: async () => {
            const formData = new FormData();
            formData.append('csrf_token', csrfToken);
            setIsMenuOpen(false);
            await logoutAction(formData);
            router.refresh();
          },
        }
      : { label: 'Log In', href: '/login' },
  ];

  const localeUrlPrefix = locale ? `/${locale}` : '';

  const mainMenuItems = [
    { label: 'Features', href: '/test' },
    { label: 'Customers', href: '#' },
    { label: 'Integrations', href: '#' },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} className='bg-[#f6f8fa]'>
      <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className='sm:hidden' />
        <NavbarBrand>
          <Link href='/'>
            <p className='font-bold text-inherit'>FEROZ FAIZ</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {mainMenuItems.map((item, index) => (
          <NavbarItem key={index} isActive={pathname === `${localeUrlPrefix}${item.href}`}>
            <Link color={pathname === `${localeUrlPrefix}${item.href}` ? undefined : 'foreground'} href={item.href}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify='end'>
        {user ? (
          <NavbarItem key='logout'>
            <form action={logoutAction}>
              <input type='hidden' name='csrf_token' value={csrfToken} />
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
            <NavbarItem key='singup'>
              <Button as={Link} color='primary' href='/signup' variant='flat'>
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              color={
                pathname === `${localeUrlPrefix}${item.href}`
                  ? 'primary'
                  : index === menuItems.length - 1
                    ? 'danger'
                    : 'foreground'
              }
              className='w-full'
              href={item.href}
              {...(item.action
                ? {
                    onClick: async (e) => {
                      e.preventDefault();
                      console.log('Logout button clicked'); //
                      await item.action();
                    },
                  }
                : { onPress: () => setIsMenuOpen(false) })}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
