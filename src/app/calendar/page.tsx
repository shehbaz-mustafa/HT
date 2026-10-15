import { SidebarNav } from '@/components/sidebar-nav';
import { CalendarView } from '@/components/calendar/calendar-view';

export const metadata = {
  title: 'Calendar – HT Ledger',
  description: 'Plan, reschedule, and visualize tasks and habits by month, week, or day.',
};

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <CalendarView />
        </div>
      </main>
    </div>
  );
}
