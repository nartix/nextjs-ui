import cx from 'clsx';
import { rem } from '@mantine/core';
import { useLogoColors, LogoProps } from './use-logo-colors'; // Custom hook
import classes from './FerozLogo.module.css'; // Create a CSS file for styles

export function FerozLogoText({ size = 50, color, inverted, style, className, ...others }: LogoProps) {
  const colors = useLogoColors({ color, inverted });

  return (
    <svg
      {...others}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 300 100'
      style={{ height: rem(size), ...style }}
      className={cx(classes.logo, className)}
    >
      <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle' fill={colors.color} style={{ fontSize: rem(size) }}>
        Feroz
      </text>
    </svg>
  );
}
