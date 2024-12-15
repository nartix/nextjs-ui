import { forwardRef } from 'react';
import { LinkIcon } from '@nextui-org/shared-icons';
import { linkAnchorClasses } from '@nextui-org/theme';

import { LinkProps as UIProps, useLink } from '@nextui-org/react';
import { Link as NextLink } from '@/i18n/routing';

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

export { Link };
// CustomLink.tsx

// import { Link as NextIntlLink } from '@/i18n/routing'; // Ensure correct import path
// import { Link as NextUILink, LinkProps as UIProps } from '@nextui-org/react';


// import {forwardRef} from "react";
// import {LinkIcon} from "@nextui-org/shared-icons";
// import {linkAnchorClasses} from "@nextui-org/theme";
// import {useLink} from "@nextui-org/react";

// const MyLink = forwardRef<HTMLAnchorElement, UIProps>((props, ref) => {
//   const {
//     Component,
//     children,
//     showAnchorIcon,
//     anchorIcon = <LinkIcon className={linkAnchorClasses} />,
//     getLinkProps,
//   } = useLink({
//     ...props,
//     ref,
//   });

//   return (
//     <NextIntlLink href={getLinkProps().href} passHref>
//       <a {...getLinkProps()}>
//         {children}
//         {showAnchorIcon && anchorIcon}
//       </a>
//     </NextIntlLink>
//   );
// });


// MyLink.displayName = "MyLink";

// export { MyLink as Link };

