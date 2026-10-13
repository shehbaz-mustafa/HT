'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>{error.message}</p>
          <button onClick={reset} style={{ marginTop: '1.5rem', border: '1px solid #ccc', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

