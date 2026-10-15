'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storage/store-context';
import {
  User,
  Moon,
  Sun,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Keyboard,
  FolderKanban,
  Check,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export function SettingsView() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetData,
    taskLists,
    createTaskList,
    deleteTaskList,
    requestNotificationPermission,
    setShortcutsOpen,
  } = useStore();

  const [displayName, setDisplayName] = useState(settings.display_name);
  const [email, setEmail] = useState(settings.email);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // New list
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#1f5c3f');

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      display_name: displayName.trim(),
      email: email.trim(),
      timezone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      updateSettings({ notifications_enabled: true });
      setNotificationStatus('Browser notifications enabled successfully.');
    } else {
      setNotificationStatus('Permission was denied or is not supported by your browser.');
    }
    setTimeout(() => setNotificationStatus(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportFeedback('Ledger data successfully restored!');
      } else {
        setImportFeedback('Failed to parse ledger JSON backup.');
      }
      setTimeout(() => setImportFeedback(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createTaskList({ name: newProjectName.trim(), color: newProjectColor });
    setNewProjectName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <header className="border-b border-border pb-6">
        <span className="label">Ledger / Configuration</span>
        <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
          Preferences & Settings
        </h1>
        <p className="mt-1 text-xs text-[--secondary]">
          Manage profile parameters, visual themes, project categorization, and persistent backups.
        </p>
      </header>

      {/* Profile & Identity */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="h-4 w-4 text-[--accent]" />
          <h2 className="font-bold text-base">User Profile & Timezone</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="label block mb-1">Email Account</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label block mb-1">Local Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-base text-sm font-mono"
            >
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">America/New_York (EST / EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
              <option value="Europe/London">Europe/London (GMT / BST)</option>
              <option value="Europe/Paris">Europe/Paris (CET)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary !w-auto px-5 !h-9 text-xs font-semibold">
              Save Profile
            </button>
            {savedSuccess && (
              <span className="text-xs font-semibold text-[--accent] flex items-center gap-1 animate-in fade-in">
                <Check className="h-4 w-4" /> Preferences saved!
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Appearance & Interface */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sun className="h-4 w-4 text-[--accent]" />
          <h2 className="font-bold text-base">Appearance & Interface</h2>
        </div>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="label block mb-2">Color Scheme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-medium transition-all ${
                  settings.theme === 'light'
                    ? 'border-[--accent] bg-[--accent]/10 text-[--fg] ring-1 ring-[--accent]'
                    : 'border-border bg-[--surface] hover:bg-[--muted] text-[--secondary]'
                }`}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Parchment Light</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-medium transition-all ${
                  settings.theme === 'dark'
                    ? 'border-[--accent] bg-[--accent]/15 text-[--fg] ring-1 ring-[--accent]'
                    : 'border-border bg-[--surface] hover:bg-[--muted] text-[--secondary]'
                }`}
              >
                <Moon className="h-4 w-4 text-[--accent]" />
                <span>Editorial Dark</span>
              </button>
            </div>
          </div>

          <div>
            <label className="label block mb-1">Calendar Week Starts On</label>
            <select
              value={settings.week_starts_on}
              onChange={(e) => updateSettings({ week_starts_on: Number(e.target.value) })}
              className="input-base text-sm"
            >
              <option value={1}>Monday (ISO Standard)</option>
              <option value={0}>Sunday</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications & Reminders */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell className="h-4 w-4 text-[--accent]" />
          <h2 className="font-bold text-base">Notifications & Reminders</h2>
        </div>

        <div className="space-y-4 max-w-xl">
          <p className="text-xs text-[--secondary]">
            Enable local and browser desktop notifications for scheduled habit reminders and upcoming task deadlines.
          </p>

          <div className="flex items-center justify-between p-3.5 rounded border border-border bg-[--surface]">
            <div>
              <p className="text-sm font-medium text-[--fg]">Browser Push Alerts</p>
              <p className="text-xs text-[--secondary]">Alert when application is active in browser</p>
            </div>
            <button
              onClick={handleEnableNotifications}
              className="btn-primary !w-auto px-4 !h-8 text-xs font-semibold"
            >
              Request Permission
            </button>
          </div>

          {notificationStatus && (
            <p className="text-xs font-semibold text-[--accent]">{notificationStatus}</p>
          )}

          <div>
            <label className="label block mb-1">Reminder Lead Time</label>
            <select
              value={settings.reminder_lead_time}
              onChange={(e) => updateSettings({ reminder_lead_time: Number(e.target.value) })}
              className="input-base text-sm"
            >
              <option value={0}>At scheduled time</option>
              <option value={10}>10 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>
        </div>
      </section>

      {/* Project & List Management */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FolderKanban className="h-4 w-4 text-[--accent]" />
          <h2 className="font-bold text-base">Custom Project Lists</h2>
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="space-y-2">
            {taskLists.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-2.5 rounded border border-border bg-[--surface] text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="font-medium text-[--fg]">{l.name}</span>
                </div>

                {l.id !== 'list-inbox' && (
                  <button
                    onClick={() => deleteTaskList(l.id)}
                    className="text-xs text-[--danger] hover:underline"
                  >
                    Delete List
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add project form */}
          <form onSubmit={handleAddProject} className="flex gap-2 items-center pt-2">
            <input
              type="text"
              placeholder="New project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="input-base text-sm !py-1.5"
            />
            <button
              type="submit"
              disabled={!newProjectName.trim()}
              className="btn-primary !w-auto px-4 !h-9 text-xs font-semibold shrink-0"
            >
              Add Project
            </button>
          </form>
        </div>
      </section>

      {/* Data Export, Backup & Recovery */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Download className="h-4 w-4 text-[--accent]" />
          <h2 className="font-bold text-base">Data Portability & Backup</h2>
        </div>

        <div className="space-y-4 max-w-xl">
          <p className="text-xs text-[--secondary]">
            Export complete ledger records for local backup, data analysis in spreadsheet software, or cross-device transfer.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportData('json')}
              className="btn-ghost !w-auto px-4 !h-9 text-xs font-medium gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Full JSON Ledger
            </button>
            <button
              onClick={() => exportData('tasks-csv')}
              className="btn-ghost !w-auto px-4 !h-9 text-xs font-medium gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Tasks CSV
            </button>
            <button
              onClick={() => exportData('habits-csv')}
              className="btn-ghost !w-auto px-4 !h-9 text-xs font-medium gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Habits CSV
            </button>
          </div>

          <div className="pt-3 border-t border-border">
            <label className="label block mb-1">Restore from JSON Backup</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-[--secondary] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-xs file:font-semibold file:bg-[--muted] file:text-[--fg] hover:file:bg-[--surface]"
            />
            {importFeedback && (
              <p className="mt-1 text-xs font-semibold text-[--accent]">{importFeedback}</p>
            )}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[--danger]">Reset Application Ledger</p>
              <p className="text-xs text-[--secondary]">Restore fresh sample data or clear history</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="rounded px-3 py-1.5 text-xs font-semibold border border-[--danger] text-[--danger] hover:bg-[--danger]/10"
            >
              Reset Data
            </button>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Reference */}
      <section className="rounded-lg border border-border bg-[--surface] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-[--accent]" />
            <h2 className="font-bold text-base">Keyboard Productivity</h2>
          </div>
          <button
            onClick={() => setShortcutsOpen(true)}
            className="text-xs text-[--accent] font-semibold hover:underline"
          >
            View Full Cheatsheet
          </button>
        </div>
        <p className="text-xs text-[--secondary]">
          Press <kbd className="rounded border border-border bg-[--muted] px-1.5 py-0.5 font-mono text-[11px]">Q</kbd> anywhere to create a task or habit, or <kbd className="rounded border border-border bg-[--muted] px-1.5 py-0.5 font-mono text-[11px]">?</kbd> for help.
        </p>
      </section>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-sm w-full rounded-lg border border-border bg-[--surface] p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[--danger]">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold font-sans">Reset Ledger Data</h3>
            </div>
            <p className="text-sm text-[--secondary]">
              This will re-initialize the application with authentic sample tasks, habits, and historical check-in records. Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="btn-ghost !w-auto px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="rounded px-4 py-2 text-xs font-semibold bg-[--danger] text-white hover:opacity-90"
              >
                Reset Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
