import { forwardRef } from 'react';
import { LinkIcon } from '@nextui-org/shared-icons';
import { linkAnchorClasses } from '@nextui-org/theme';

import { LinkProps as UIProps, useLink } from '@nextui-org/react';
// import { default as NextLink } from 'next-intl/navigation';
import { Link as NextLink } from '@/i18n/routing';
// import { default as NextLink, LinkProps as NextProps } from 'next/link';

const Link = forwardRef<HTMLAnchorElement, UIProps>((props, ref) => {
  const {
    children,
    showAnchorIcon,
    anchorIcon = <LinkIcon className={linkAnchorClasses} />,
    getLinkProps,
  } = useLink({
    ...props,
    ref,
  });

  return (
    //@ts-expect-error getLinkProps type is missing anchor element props
    <NextLink {...getLinkProps()}>
      <>
        {children}
        {showAnchorIcon && anchorIcon}
      </>
    </NextLink>
  );
});

Link.displayName = 'AppLink';

export default Link;
