import { SidebarNav } from '@/components/sidebar-nav';
import { TasksView } from '@/components/tasks/tasks-view';

export const metadata = {
  title: 'Tasks – HT Ledger',
  description: 'Manage, schedule, filter, and organize tasks and projects.',
};

export default function TasksPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <TasksView />
        </div>
      </main>
    </div>
  );
}
