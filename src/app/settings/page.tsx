import { SidebarNav } from '@/components/sidebar-nav';
import { SettingsView } from '@/components/settings/settings-view';

export const metadata = {
  title: 'Settings – HT Ledger',
  description: 'Manage preferences, appearance, notifications, and ledger backup/export.',
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 md:ml-48">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8 mt-12 md:mt-0">
          <SettingsView />
        </div>
      </main>
    </div>
  );
}
