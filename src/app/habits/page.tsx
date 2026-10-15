import { SidebarNav } from '@/components/sidebar-nav';
import { HabitsView } from '@/components/habits/habits-view';

export const metadata = {
  title: 'Habits – HT Ledger',
  description: 'Track daily routines, streaks, and numeric targets.',
};

export default function HabitsPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <HabitsView />
        </div>
      </main>
    </div>
  );
}
