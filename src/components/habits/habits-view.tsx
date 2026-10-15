'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { Habit, HabitCategory, HabitStatus } from '@/lib/types';
import { calculateHabitStats, isHabitScheduled, isHabitCompleted } from '@/lib/habit-logic';
import { addDays, weekOf, isoDow } from '@/lib/dates';
import {
  Plus,
  Flame,
  Award,
  Check,
  Edit2,
  Clock,
  Sparkles,
  BarChart2,
  Calendar,
  FileText,
  Filter,
  CheckCircle,
  Archive,
  Play,
  Pause,
} from 'lucide-react';

export function HabitsView() {
  const {
    habits,
    habitLogs,
    today,
    toggleHabit,
    logHabitProgress,
    updateHabit,
    setQuickAddOpen,
    setEditingHabit,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<HabitStatus | 'all'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [noteModalHabit, setNoteModalHabit] = useState<{ id: string; name: string; notes: string } | null>(null);

  // Categories present in habits
  const categories = Array.from(new Set(habits.map((h) => h.category || 'General')));

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    return true;
  });

  // Aggregate stats
  const activeHabits = habits.filter((h) => h.status === 'active');
  const habitStatsList = habits.map((h) => ({
    habit: h,
    stats: calculateHabitStats(h, habitLogs, today),
  }));

  const bestStreak = habitStatsList.reduce((max, curr) => Math.max(max, curr.stats.currentStreak), 0);
  const avgCompletionRate =
    habitStatsList.length > 0
      ? Math.round(
          habitStatsList.reduce((sum, curr) => sum + curr.stats.completionRate, 0) /
            habitStatsList.length
        )
      : 0;

  // Past 7 days
  const past7Days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalHabit) return;
    const currentLog = habitLogs.find((l) => l.habit_id === noteModalHabit.id && l.date === today);
    logHabitProgress(
      noteModalHabit.id,
      today,
      currentLog?.value ?? 1,
      noteModalHabit.notes
    );
    setNoteModalHabit(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label">Ledger / Habit Protocols</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
            Habits & Consistency
          </h1>
          <p className="mt-1 text-xs text-[--secondary]">
            Define recurring behaviors, track real streaks according to schedule, and log progress.
          </p>
        </div>

        <button
          onClick={() => setQuickAddOpen(true)}
          className="btn-primary !w-auto !h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Protocol
        </button>
      </header>

      {/* Aggregate Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-[--surface]">
          <span className="label block">Active Protocols</span>
          <span className="font-mono text-2xl font-bold mt-1 block">{activeHabits.length}</span>
          <span className="text-[11px] text-[--secondary]">
            {habits.filter((h) => h.status === 'paused').length} paused
          </span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface]">
          <span className="label block">Average Consistency</span>
          <span className="font-mono text-2xl font-bold mt-1 text-[--accent] block">
            {avgCompletionRate}%
          </span>
          <span className="text-[11px] text-[--secondary]">Across all tracked history</span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface]">
          <span className="label block">Best Active Streak</span>
          <span className="font-mono text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Flame className="h-5 w-5 fill-current" />
            {bestStreak}d
          </span>
          <span className="text-[11px] text-[--secondary]">Schedule-aware continuity</span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface]">
          <span className="label block">Total Check-ins</span>
          <span className="font-mono text-2xl font-bold mt-1 block">{habitLogs.length}</span>
          <span className="text-[11px] text-[--secondary]">Historical ledger entries</span>
        </div>
      </section>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-[--muted] p-1 rounded-md border border-border text-xs">
          {(['active', 'paused', 'archived', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-3 py-1 font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? 'bg-[--surface] text-[--fg] shadow-sm'
                  : 'text-[--secondary] hover:text-[--fg]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="label text-[10px]">Category:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-3 py-0.5 text-xs font-medium border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[--fg] text-[--bg] border-[--fg]'
                : 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-0.5 text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                  : 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="py-20 text-center rounded-lg border border-dashed border-border bg-[--surface]/40 p-8 space-y-3">
          <p className="font-serif text-2xl text-[--secondary]">-</p>
          <p className="font-serif text-lg text-[--fg]">No habits in this category or state</p>
          <p className="text-xs text-[--secondary] max-w-sm mx-auto">
            Create a new habit or adjust your filter to view paused or archived habits.
          </p>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-primary !w-auto px-5 !h-9 text-xs font-semibold mx-auto mt-2"
          >
            Create Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map((h) => {
            const stats = calculateHabitStats(h, habitLogs, today);
            const todayLog = habitLogs.find((l) => l.habit_id === h.id && l.date === today);
            const isDoneToday = isHabitCompleted(h, todayLog);
            const isScheduledToday = isHabitScheduled(h, today);
            const currentValue = todayLog?.value ?? 0;

            return (
              <div
                key={h.id}
                className="rounded-lg border border-border bg-[--surface] p-5 shadow-sm space-y-4 hover:border-[--border]/80 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-xl shrink-0 shadow-sm"
                      style={{
                        backgroundColor: `${h.color}15`,
                        border: `1px solid ${h.color}35`,
                      }}
                    >
                      {h.icon}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-[--fg] font-serif">{h.name}</h3>
                        <span className="rounded bg-[--muted] px-2 py-0.2 text-[10px] font-mono text-[--secondary]">
                          {h.category}
                        </span>
                        {h.status === 'paused' && (
                          <span className="rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.2 text-[10px] font-mono uppercase font-semibold">
                            Paused
                          </span>
                        )}
                        {h.status === 'archived' && (
                          <span className="rounded bg-[--muted] text-[--secondary] px-2 py-0.2 text-[10px] font-mono uppercase font-semibold">
                            Archived
                          </span>
                        )}
                      </div>

                      {h.description && (
                        <p className="text-xs text-[--secondary] mt-1 line-clamp-1">
                          {h.description}
                        </p>
                      )}

                      <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-[--secondary] flex-wrap">
                        <span>
                          {h.frequency_type === 'daily'
                            ? 'Every day'
                            : h.frequency_type === 'weekly'
                            ? 'Weekly'
                            : 'Selected days'}
                        </span>
                        {h.reminder_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {h.reminder_time}
                          </span>
                        )}
                        <span>
                          Target:{' '}
                          {h.target_type === 'numeric'
                            ? `${h.target_value} ${h.target_unit}`
                            : 'Completion'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Streak & KPI badges */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <div className="text-right">
                      <span className="label block">Streak</span>
                      <span className="font-mono text-sm font-bold text-[--accent] flex items-center justify-end gap-1">
                        <Flame className="h-4 w-4 fill-current" />
                        {stats.currentStreak}d
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="label block">Longest</span>
                      <span className="font-mono text-sm font-bold flex items-center justify-end gap-1 text-[--fg]">
                        <Award className="h-4 w-4 text-amber-600" />
                        {stats.longestStreak}d
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="label block">Rate</span>
                      <span className="font-mono text-sm font-bold text-[--fg]">
                        {stats.completionRate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-border pl-3">
                      <button
                        onClick={() =>
                          setNoteModalHabit({
                            id: h.id,
                            name: h.name,
                            notes: todayLog?.notes || '',
                          })
                        }
                        className="p-1.5 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                        title="Add/Edit Note"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingHabit(h)}
                        className="p-1.5 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                        title="Edit Habit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 7-Day interactive sparkline & Today's Logger */}
                <div className="border-t border-border pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Past 7 days mini-ledger */}
                  <div className="flex items-center gap-1.5">
                    <span className="label text-[10px] mr-1">Past 7 Days:</span>
                    {past7Days.map((dateStr) => {
                      const isSch = isHabitScheduled(h, dateStr);
                      const log = habitLogs.find(
                        (l) => l.habit_id === h.id && l.date === dateStr
                      );
                      const done = isHabitCompleted(h, log);
                      const isCurrent = dateStr === today;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => toggleHabit(h.id, dateStr)}
                          title={`${dateStr}: ${
                            done ? 'Completed' : isSch ? 'Scheduled (Not done)' : 'Not scheduled'
                          }`}
                          className={`h-7 w-7 rounded flex flex-col items-center justify-center text-[10px] font-mono border transition-all ${
                            isCurrent ? 'ring-2 ring-[--accent] font-bold' : ''
                          } ${
                            done
                              ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                              : isSch
                              ? 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
                              : 'bg-[--muted]/50 text-[--secondary] opacity-40 border-dashed'
                          }`}
                        >
                          <span>{dateStr.slice(8)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Today's Action */}
                  <div className="flex items-center gap-3">
                    {h.target_type === 'numeric' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            logHabitProgress(
                              h.id,
                              today,
                              Math.max(0, currentValue - (h.target_value <= 5 ? 0.5 : 1))
                            )
                          }
                          className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-[--muted] font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-semibold">
                          {currentValue} / {h.target_value} {h.target_unit}
                        </span>
                        <button
                          onClick={() =>
                            logHabitProgress(
                              h.id,
                              today,
                              currentValue + (h.target_value <= 5 ? 0.5 : 1)
                            )
                          }
                          className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-[--muted] font-bold text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => toggleHabit(h.id, today)}
                          className={`rounded px-2.5 py-1 text-xs font-semibold font-mono uppercase tracking-wider transition-colors border ${
                            isDoneToday
                              ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                              : 'bg-[--surface] text-[--secondary] border-border hover:border-[--accent]'
                          }`}
                        >
                          {isDoneToday ? 'Done' : 'Complete'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleHabit(h.id, today)}
                        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                          isDoneToday
                            ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                            : 'bg-[--surface] text-[--secondary] border-border hover:border-[--accent]'
                        }`}
                      >
                        {isDoneToday ? (
                          <>
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            Completed Today
                          </>
                        ) : (
                          'Check-in Today'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note modal */}
      {noteModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveNote}
            className="w-full max-w-sm rounded-lg border border-border bg-[--surface] p-5 shadow-2xl space-y-4"
          >
            <div>
              <span className="label block">Check-in Note</span>
              <h3 className="font-bold text-base">{noteModalHabit.name}</h3>
            </div>
            <textarea
              rows={3}
              placeholder="Record a thought, metric, or reflection..."
              value={noteModalHabit.notes}
              onChange={(e) =>
                setNoteModalHabit({ ...noteModalHabit, notes: e.target.value })
              }
              className="input-base text-sm resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteModalHabit(null)}
                className="btn-ghost !w-auto px-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !w-auto px-4 text-xs">
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
