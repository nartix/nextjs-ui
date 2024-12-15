import React from 'react';
import { ContentContainer } from '@/components/common/ui/content-container';
import { Skeleton } from '@/components/common/ui/skeleton/skeleton';

function HomeContentSkeleton() {
  return (
    <div>
      <Skeleton className='h-8 w-1/3 mb-4' />
      <div className='space-y-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
      </div>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <ContentContainer>
      <HomeContentSkeleton />
    </ContentContainer>
  );
}
