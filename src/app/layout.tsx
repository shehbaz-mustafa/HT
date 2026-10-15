import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/app-provider';

export const metadata: Metadata = {
  title: 'HT – Habit Tracker & Task Management',
  description: 'A polished, intentional task management and habit tracking protocol.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
