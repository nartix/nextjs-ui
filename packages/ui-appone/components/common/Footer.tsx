'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';

import Container from '@nartix/ui-appone/components/common/ui/Containers';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  companyName?: string;
  links?: FooterLink[];
}

const Footer = ({
  companyName = 'Your Company', // Default company name
  links = [
    // Default footer links
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
  ],
}: FooterProps) => {
  const { theme } = useTheme();
  return (
    <footer
      className={`bg-[#f6f8fa] text-gray-500 w-ful h-auto justify-center mt-10 ${
        theme === 'dark' ? 'bg-gray-800 text-gray-300' : ''
      }`}
    >
      <Container as='section' className='py-6 px-6'>
        <div className='flex flex-col items-center justify-between sm:flex-row'>
          <div className='text-center sm:text-left'>
            <p className='text-sm'>
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
          </div>
          {links.length > 0 && (
            <div className='mt-4 flex space-x-4 sm:mt-0'>
              {links.map((link, index) => (
                <Link key={index} href={link.href} className='text-sm hover:text-gray-400'>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
