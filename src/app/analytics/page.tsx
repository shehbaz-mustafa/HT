import { SidebarNav } from '@/components/sidebar-nav';
import { AnalyticsView } from '@/components/analytics-view';

export const metadata = {
  title: 'Analytics – HT Ledger',
  description: 'Habit and task execution analytics, heatmaps, streaks, and focus metrics.',
};

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <AnalyticsView />
        </div>
      </main>
    </div>
  );
}
