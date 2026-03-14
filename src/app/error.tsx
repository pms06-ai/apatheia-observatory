'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-serif text-copper/60">Error</p>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <Button variant="primary" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
