'use client';

import { ApplicationError } from '@/components/common/Error/Error';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return <ApplicationError error={error} reset={reset} />;
}
