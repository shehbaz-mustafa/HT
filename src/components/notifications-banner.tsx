'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storage/store-context';
import { Bell, AlertCircle, Clock, X, Check } from 'lucide-react';

export function NotificationsBanner() {
  const { notifications, dismissNotification, requestNotificationPermission } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-8 w-8 rounded-full hover:bg-[--muted] text-[--fg] transition-colors border border-border"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[--danger] text-[10px] font-bold text-white animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 rounded-lg border border-border bg-[--surface] shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="label font-bold">Ledger Reminders ({notifications.length})</span>
              <button
                onClick={() => requestNotificationPermission()}
                className="text-[11px] text-[--accent] hover:underline"
              >
                Enable Desktop Alerts
              </button>
            </div>

            <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-2 p-2 rounded border text-xs ${
                    n.isOverdue
                      ? 'border-[--danger]/40 bg-[--danger]/10 text-[--danger]'
                      : 'border-border bg-[--muted]/50 text-[--fg]'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    {n.isOverdue ? (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="h-4 w-4 shrink-0 mt-0.5 text-[--secondary]" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{n.title}</p>
                      <p className="text-[10px] text-[--secondary] mt-0.5">{n.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="p-1 text-[--secondary] hover:text-[--fg]"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
