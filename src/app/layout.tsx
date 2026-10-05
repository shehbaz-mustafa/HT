import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HT – Habit Tracker',
  description: 'Track your habits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
