import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-serif text-gold/60">404</p>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try navigating from the sidebar or searching with{' '}
        <kbd className="rounded border border-line bg-bg-elevated px-1.5 py-0.5 text-xs font-mono text-text-faint">
          Cmd+K
        </kbd>
      </p>
      <Link href="/" className="mt-6">
        <Button variant="primary">Back to Observatory</Button>
      </Link>
    </div>
  );
}
