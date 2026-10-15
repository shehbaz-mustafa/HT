'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/storage/store-context';
import {
  Sun,
  Moon,
  Plus,
  CheckSquare,
  Flame,
  Calendar as CalendarIcon,
  BarChart3,
  Settings as SettingsIcon,
  Compass,
  Menu,
  X,
  Keyboard,
} from 'lucide-react';

const links = [
  { href: '/today', label: 'Today', icon: Compass },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/habits', label: 'Habits', icon: Flame },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function SidebarNav({ recordDate }: { recordDate?: string }) {
  const path = usePathname();
  const {
    today,
    settings,
    updateSettings,
    setQuickAddOpen,
    setShortcutsOpen,
    tasks,
    notifications,
  } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  const displayDate = recordDate || today.replace(/-/g, '.');
  const overdueCount = tasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[--fg]">HT</span>
              <span className="rounded bg-[--accent]/15 px-1.5 py-0.5 text-[9px] font-bold text-[--accent] uppercase tracking-widest">
                Ledger
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[--secondary]">Habits & Task Protocol</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded hover:bg-[--muted] text-[--secondary]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Add CTA */}
        <div className="p-3">
          <button
            onClick={() => {
              setQuickAddOpen(true);
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-[--accent] py-2 px-3 text-xs font-semibold text-[--on-accent] shadow-sm hover:bg-[--accent-hover] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add</span>
            <kbd className="ml-auto rounded bg-black/20 px-1 py-0.2 text-[10px] font-mono opacity-80">
              Q
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-2 mt-2">
          {links.map((l) => {
            const Icon = l.icon;
            const isActive =
              path === l.href || (l.href !== '/' && path.startsWith(l.href));

            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[--muted] font-semibold text-[--fg]'
                    : 'text-[--secondary] hover:bg-[--muted]/60 hover:text-[--fg]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[--accent]' : 'text-[--secondary]'}`} />
                  <span>{l.label}</span>
                </div>

                {l.href === '/tasks' && overdueCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[--danger] px-1 text-[10px] font-bold text-white">
                    {overdueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded p-1.5 text-xs text-[--secondary] hover:bg-[--muted] hover:text-[--fg] transition-colors"
            title="Toggle Light / Dark mode"
          >
            {settings.theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[--accent]" />
                <span className="font-mono text-[11px]">Dark</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShortcutsOpen(true)}
            className="rounded p-1.5 text-[--secondary] hover:bg-[--muted] hover:text-[--fg] transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </button>
        </div>

        <div>
          <span className="label block">Ledger Date</span>
          <p className="mt-0.5 font-mono text-xs text-[--secondary]">{displayDate}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-border bg-[--surface] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1 rounded hover:bg-[--muted] text-[--fg]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif text-xl font-bold tracking-tight">HT</span>
        </div>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="rounded-md bg-[--accent] px-3 py-1.5 text-xs font-semibold text-[--on-accent]"
        >
          + Add
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-20 w-48 flex-col border-r border-border bg-[--surface]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-64 flex flex-col bg-[--surface] border-r border-border h-full shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
