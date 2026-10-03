import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HT – Habit Tracker',
  description: 'Track your habits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

