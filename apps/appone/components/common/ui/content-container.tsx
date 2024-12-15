import React from 'react';
import Container from '@/components/common/ui/container';
import { cn } from '@/lib/utils';

interface ContentContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ as = 'main', className = '', children, ...props }) => {
  return (
    <Container as={as} className={cn('flex-grow pt-10 px-6', className)} {...props}>
      {children}
    </Container>
  );
};

export { ContentContainer };
