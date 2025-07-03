'use client';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { ActionIcon, Anchor, Group, Text } from '@mantine/core';
import { RESUME_LINK } from '@/config/client-config';
import classes from './Footer.module.css';
import { Link } from '@/i18n/routing';

const links = [
  { link: RESUME_LINK, label: 'Resume', target: '_blank' },
  { link: 'https://ferozfaiz.com', label: 'FerozFaiz.com', target: '_blank' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      component={Link}
      c='dimmed'
      key={link.label}
      href={link.link}
      lh={1}
      // onClick={(event) => event.preventDefault()}
      size='sm'
      target={link.target ? link.target : '_self'}
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={`${classes.footer}`}>
      <div className={classes.inner}>
        <Text c='dimmed' lh={1} size='sm'>
          © {new Date().getFullYear()} Feroz Faiz
        </Text>

        <Group className={classes.links}>{items}</Group>

        <Group gap='xs' justify='flex-end' wrap='nowrap'>
          <ActionIcon
            size='lg'
            variant='default'
            radius='xl'
            component='a'
            href='https://www.linkedin.com/in/feroz-faiz/'
            target='_blank'
          >
            <IconBrandLinkedin size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            size='lg'
            variant='default'
            radius='xl'
            component='a'
            href='https://github.com/nartix/feroz'
            target='_blank'
          >
            <IconBrandGithub size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  );
}
