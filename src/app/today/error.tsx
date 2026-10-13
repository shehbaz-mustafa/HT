'use client';
import { useEffect } from 'react';

export default function TodayError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <p className="text-2xl font-medium">Something went wrong</p>
      <p className="mt-2 text-sm text-secondary">{error.message}</p>
      <button onClick={reset} className="mt-6 border border-border px-4 py-2 text-sm hover:bg-muted">
        Try again
      </button>
    </div>
  );
}

