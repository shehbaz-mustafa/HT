import { SidebarNav } from '@/components/sidebar-nav';
import { TodayDashboard } from '@/components/dashboard/today-dashboard';

export const metadata = {
  title: 'Today – HT Ledger',
  description: "Today's tasks and scheduled habits overview.",
};

export default function TodayPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <TodayDashboard />
        </div>
      </main>
    </div>
  );
}
