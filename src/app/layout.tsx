import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/app-provider';

export const metadata: Metadata = {
  title: 'HT - Habit and Task Ledger',
  description: 'Structured personal ledger for habit protocols and task scheduling.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
