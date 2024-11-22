import { ReactNode, ElementType, CSSProperties } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'; // Define common sizes
  className?: string; // Allow custom class names
  as?: ElementType; // Allow specifying the HTML element type
  style?: CSSProperties; // Allow custom styles
  [key: string]: unknown; // Allow any other props
}

const Container = ({
  children,
  size = '5xl', // Default size
  className = '', // Default className as empty string
  as: Component = 'div', // Default HTML element is 'div'
  style = {}, // Default style is an empty object
  ...rest // Spread the remaining props
}: ContainerProps) => {
  // Map size prop to TailwindCSS classes
  const sizeClasses = {
    xs: 'max-w-xs', // max-width: 20rem (320px)
    sm: 'max-w-sm', // max-width: 24rem (384px)
    md: 'max-w-md', // max-width: 28rem (448px)
    lg: 'max-w-lg', // max-width: 32rem (512px)
    xl: 'max-w-screen-xl', // max-width: 1280px
    '2xl': 'max-w-2xl', // max-width: 42rem (672px)
    '3xl': 'max-w-3xl', // max-width: 48rem (768px)
    '4xl': 'max-w-4xl', // max-width: 56rem (896px)
    '5xl': 'max-w-5xl', // max-width: 64rem (1024px)
    '6xl': 'max-w-6xl', // max-width: 72rem (1152px)
    '7xl': 'max-w-7xl', // max-width: 80rem (1280px)
    full: 'max-w-full', // max-width: 100%
  };

  // Combine classes
  const combinedClasses = `container mx-auto ${sizeClasses[size]} ${className}`;

  return (
    <Component className={combinedClasses} style={style} {...rest}>
      {children}
    </Component>
  );
};

export default Container;
