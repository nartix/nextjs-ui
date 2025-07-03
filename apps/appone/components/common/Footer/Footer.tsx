'use client';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { ActionIcon, Anchor, Group, Text } from '@mantine/core';
import { RESUME_LINK, GITHUB_LINK, LINKEDIN_LINK, FEROZ_FAIZ_LINK } from '@/config/client-config';
import classes from './Footer.module.css';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  const links = [
    { link: RESUME_LINK, label: t('resume'), target: '_blank' },
    { link: FEROZ_FAIZ_LINK, label: t('ferozfaizcom'), target: '_blank' },
  ];

  const items = links.map((link) => (
    <Anchor
      component={Link}
      c='dimmed'
      key={link.label}
      href={link.link}
      lh={1}
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
          © {new Date().getFullYear()} {t('ferozfaiz')}. {t('all_rights_reserved')}
        </Text>

        <Group className={classes.links}>{items}</Group>

        <Group gap='xs' justify='flex-end' wrap='nowrap'>
          <ActionIcon size='lg' variant='default' radius='xl' component='a' href={LINKEDIN_LINK} target='_blank'>
            <IconBrandLinkedin size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='default' radius='xl' component='a' href={GITHUB_LINK} target='_blank'>
            <IconBrandGithub size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  );
}
