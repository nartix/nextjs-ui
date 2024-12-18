import { Link as NextIntlLink } from '@/i18n/routing';
import {forwardRef} from "react";
import {LinkIcon} from "@nextui-org/shared-icons";
import {linkAnchorClasses} from "@nextui-org/theme";
import {useLink, LinkProps as UIProps} from "@nextui-org/react";

const MyLink = forwardRef<HTMLAnchorElement, UIProps>((props, ref) => {
  const {
    children,
    showAnchorIcon,
    anchorIcon = <LinkIcon className={linkAnchorClasses} />,
    getLinkProps,
  } = useLink({
    ...props,
    ref,
  });
  // onClick causes 307 redirect when used with next intl link
  const { onClick, href,  ...linkProps } = getLinkProps();
  return (
    <NextIntlLink href={props.href || '#'} {...linkProps}>
      <>
        {children}
        {showAnchorIcon && anchorIcon}
      </>
    </NextIntlLink>
  );
});

MyLink.displayName = "MyLink";

export  { MyLink as Link };
