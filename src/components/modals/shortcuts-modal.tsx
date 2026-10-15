'use client';

import React from 'react';
import { useStore } from '@/lib/storage/store-context';
import { X, Command } from 'lucide-react';

export function ShortcutsModal() {
  const { isShortcutsOpen, setShortcutsOpen } = useStore();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Q / N', desc: 'Open Quick Add (New Task or Habit)' },
    { key: '?', desc: 'Toggle keyboard shortcuts menu' },
    { key: 'Esc', desc: 'Close open modal, drawer, or dialog' },
    { key: '1', desc: 'Navigate to Today Dashboard' },
    { key: '2', desc: 'Navigate to Tasks Board' },
    { key: '3', desc: 'Navigate to Habits Tracker' },
    { key: '4', desc: 'Navigate to Calendar Planner' },
    { key: '5', desc: 'Navigate to Analytics & Insights' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-[--surface] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-[--muted]/40">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4 text-[--accent]" />
            <h3 className="font-bold text-sm tracking-tight">Keyboard Navigation & Shortcuts</h3>
          </div>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="rounded p-1 text-[--secondary] hover:bg-[--muted] hover:text-[--fg]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 divide-y divide-border">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-[--secondary]">{s.desc}</span>
              <kbd className="rounded border border-border bg-[--muted] px-2 py-0.5 font-mono text-xs font-semibold text-[--fg]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-3 bg-[--muted]/20 text-right">
          <button
            onClick={() => setShortcutsOpen(false)}
            className="btn-primary !w-auto px-4 !h-8 text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
