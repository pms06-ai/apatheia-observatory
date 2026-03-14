'use client';

export default function ActorsError({
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
        Failed to load actor data
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        {error.message || 'An unexpected error occurred while loading actor profiles.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-gold/10 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/20"
      >
        Try again
      </button>
    </div>
  );
}
