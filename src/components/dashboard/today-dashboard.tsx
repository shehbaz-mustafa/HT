'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storage/store-context';
import { calculateHabitStats, isHabitScheduled, isHabitCompleted } from '@/lib/habit-logic';
import { weekOf, longDate, isoDow, addDays } from '@/lib/dates';
import { NotificationsBanner } from '@/components/notifications-banner';
import {
  Check,
  Plus,
  Flame,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Edit2,
  RotateCcw,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import type { Task, Habit, PriorityLevel } from '@/lib/types';

export function TodayDashboard() {
  const {
    today,
    tasks,
    habits,
    habitLogs,
    settings,
    toggleTask,
    toggleHabit,
    logHabitProgress,
    updateTask,
    setQuickAddOpen,
    setEditingTask,
    setEditingHabit,
    isLoaded,
  } = useStore();

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [noteModalHabit, setNoteModalHabit] = useState<{ id: string; name: string; notes: string } | null>(null);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Weekly dates
  const weekDates = weekOf(today);

  // Today's tasks
  const todayTasks = tasks.filter((t) => t.due_date === today);
  const overdueTasks = tasks.filter((t) => !t.completed && t.due_date && t.due_date < today);
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const totalTodayTasks = todayTasks.length;
  const taskCompletionRate = totalTodayTasks > 0 ? Math.round((completedTodayTasks / totalTodayTasks) * 100) : 0;

  // Filtered task list
  const filteredTasks = todayTasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  // Today's scheduled habits
  const scheduledHabits = habits.filter(
    (h) => h.status === 'active' && isHabitScheduled(h, today)
  );

  const habitRows = scheduledHabits.map((h) => {
    const log = habitLogs.find((l) => l.habit_id === h.id && l.date === today);
    const stats = calculateHabitStats(h, habitLogs, today);
    const isDone = isHabitCompleted(h, log);
    const currentValue = log?.value ?? 0;

    return {
      habit: h,
      log,
      stats,
      isDone,
      currentValue,
    };
  });

  const completedHabitsCount = habitRows.filter((r) => r.isDone).length;
  const totalHabitsCount = habitRows.length;
  const habitCompletionRate = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // Best streak highlight
  const bestStreakHabit = habits
    .map((h) => ({ habit: h, stats: calculateHabitStats(h, habitLogs, today) }))
    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)[0];

  // Quick task submit
  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    const { createTask } = useStore();
    createTask({
      title: quickTaskTitle.trim(),
      due_date: today,
      priority: 'medium',
    });
    setQuickTaskTitle('');
  };

  const priorityColor = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return 'text-[--danger] bg-[--danger]/10 border-[--danger]/30';
      case 'high':
        return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'medium':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'low':
        return 'text-[--secondary] bg-[--muted] border-border';
    }
  };

  const handleSaveHabitNote = (e: React.FormEvent) => {
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

  if (!isLoaded) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-xl text-[--secondary]">Opening ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label">Logbook / Today&apos;s Protocol</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
            {getGreeting()}, {settings.display_name.split(' ')[0]}
          </h1>
          <p className="mt-1 font-mono text-xs text-[--secondary]">{longDate(today)}</p>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsBanner />
          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-primary !w-auto !h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Quick Record
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasks progress card */}
        <div className="p-5 rounded-lg border border-border bg-[--surface] space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">Today&apos;s Tasks</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[--muted] text-[--fg]">
              {taskCompletionRate}% Done
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-[--fg]">
              {completedTodayTasks}
            </span>
            <span className="font-mono text-sm text-[--secondary]">/ {totalTodayTasks} completed</span>
          </div>
          <div className="h-1.5 w-full bg-[--muted] rounded-full overflow-hidden">
            <div
              className="h-full bg-[--accent] transition-all duration-300"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
          <p className="text-xs text-[--secondary]">
            {totalTodayTasks - completedTodayTasks === 0
              ? 'All planned tasks finished today.'
              : `${totalTodayTasks - completedTodayTasks} task${totalTodayTasks - completedTodayTasks > 1 ? 's' : ''} remaining.`}
          </p>
        </div>

        {/* Habits progress card */}
        <div className="p-5 rounded-lg border border-border bg-[--surface] space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">Scheduled Habits</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[--accent]/15 text-[--accent]">
              {habitCompletionRate}% Completed
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-[--fg]">
              {completedHabitsCount}
            </span>
            <span className="font-mono text-sm text-[--secondary]">/ {totalHabitsCount} checked in</span>
          </div>
          <div className="h-1.5 w-full bg-[--muted] rounded-full overflow-hidden">
            <div
              className="h-full bg-[--accent] transition-all duration-300"
              style={{ width: `${habitCompletionRate}%` }}
            />
          </div>
          <p className="text-xs text-[--secondary]">
            {totalHabitsCount - completedHabitsCount === 0
              ? 'All habit protocols satisfied for today!'
              : `${totalHabitsCount - completedHabitsCount} habit${totalHabitsCount - completedHabitsCount > 1 ? 's' : ''} left for check-in.`}
          </p>
        </div>

        {/* Streak Highlight Card */}
        <div className="p-5 rounded-lg border border-border bg-[--surface] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="label">Streak Leader</span>
              <Flame className="h-4 w-4 text-[--accent] fill-[--accent]" />
            </div>
            {bestStreakHabit && bestStreakHabit.stats.currentStreak > 0 ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{bestStreakHabit.habit.icon}</span>
                  <span className="font-serif font-bold text-base truncate">
                    {bestStreakHabit.habit.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono text-2xl font-bold text-[--accent]">
                  <span>{bestStreakHabit.stats.currentStreak}</span>
                  <span className="text-xs text-[--secondary] font-normal uppercase">consecutive days</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-[--secondary]">
                Check off habits today to build and compound your consistency streak.
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-border mt-3 flex items-center justify-between text-xs text-[--secondary]">
            <span>Active Protocols: {habits.filter((h) => h.status === 'active').length}</span>
            <span className="font-mono">{longDate(today).split(' ')[1]}</span>
          </div>
        </div>
      </section>

      {/* Overdue Tasks Alert Strip */}
      {overdueTasks.length > 0 && (
        <section className="rounded-lg border border-[--danger]/40 bg-[--danger]/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[--danger] font-semibold text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Requiring Action</span>
            </div>
            <span className="text-xs text-[--secondary]">Reschedule or complete to clear ledger backlog</span>
          </div>

          <div className="divide-y divide-[--danger]/20">
            {overdueTasks.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="h-4 w-4 rounded-sm border border-[--danger] flex items-center justify-center hover:bg-[--danger]/10"
                    title="Mark Done"
                  />
                  <span className="font-medium text-[--fg] truncate">{t.title}</span>
                  <span className="font-mono text-xs text-[--danger]">Due {t.due_date}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateTask(t.id, { due_date: today })}
                    className="text-xs px-2.5 py-1 rounded border border-border bg-[--surface] hover:bg-[--muted] text-[--fg] font-medium"
                  >
                    Move to Today
                  </button>
                  <button
                    onClick={() => setEditingTask(t)}
                    className="p-1 text-[--secondary] hover:text-[--fg]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weekly Ledger Strip */}
      <section className="rounded-lg border border-border bg-[--surface] p-5 space-y-3">
        <span className="label">Weekly Ledger Overview</span>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((dateStr, idx) => {
            const isCurrent = dateStr === today;
            const scheduledForDate = habits.filter((h) => h.status === 'active' && isHabitScheduled(h, dateStr));
            const doneForDate = scheduledForDate.filter((h) =>
              habitLogs.some((l) => l.habit_id === h.id && l.date === dateStr && isHabitCompleted(h, l))
            ).length;
            const tasksOnDate = tasks.filter((t) => t.due_date === dateStr);
            const tasksDoneOnDate = tasksOnDate.filter((t) => t.completed).length;

            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center p-2 rounded border text-center transition-all ${
                  isCurrent
                    ? 'border-2 border-[--accent] bg-[--muted]/60 shadow-sm'
                    : 'border-border bg-[--surface] hover:bg-[--muted]/30'
                }`}
              >
                <span className="label text-[10px]">{'MTWTFSS'[idx]}</span>
                <span className="font-mono text-sm font-bold mt-0.5">{dateStr.slice(8)}</span>

                {/* Habit squares */}
                <div className="mt-2 grid grid-cols-2 gap-0.5">
                  {scheduledForDate.slice(0, 4).map((h) => {
                    const done = habitLogs.some(
                      (l) => l.habit_id === h.id && l.date === dateStr && isHabitCompleted(h, l)
                    );
                    return (
                      <span
                        key={h.id}
                        className={`h-2 w-2 rounded-sm border ${
                          done ? 'bg-[--accent] border-[--accent]' : 'bg-transparent border-border'
                        }`}
                      />
                    );
                  })}
                </div>

                <span className="mt-2 font-mono text-[10px] text-[--secondary]">
                  {scheduledForDate.length > 0 ? `${doneForDate}/${scheduledForDate.length}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Column Execution Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Tasks */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="label">Today&apos;s Tasks ({todayTasks.length})</span>
            </div>
            <div className="flex items-center gap-1 bg-[--muted] p-0.5 rounded border border-border text-xs">
              {(['all', 'pending', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    taskFilter === filter
                      ? 'bg-[--surface] font-semibold text-[--fg] shadow-sm'
                      : 'text-[--secondary] hover:text-[--fg]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Inline Quick Add Task */}
          <form onSubmit={handleQuickTaskSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="+ Add a task for today (Press Enter to record)"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              className="input-base text-sm"
            />
            <button
              type="submit"
              disabled={!quickTaskTitle.trim()}
              className="btn-primary !w-auto px-4 !h-10 text-xs font-semibold"
            >
              Add
            </button>
          </form>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center rounded border border-dashed border-border bg-[--surface]/50 p-6 space-y-2">
              <p className="font-serif text-lg text-[--secondary]">
                {taskFilter === 'all'
                  ? 'No tasks scheduled for today.'
                  : `No ${taskFilter} tasks found.`}
              </p>
              <p className="text-xs text-[--secondary]">
                Capture action items above or use the Quick Record button.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border bg-[--surface] overflow-hidden">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 flex items-start justify-between gap-3 hover:bg-[--muted]/40 transition-colors ${
                    t.completed ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Stitch signature square check button */}
                    <button
                      onClick={() => toggleTask(t.id)}
                      aria-label={`Toggle ${t.title}`}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                        t.completed
                          ? 'border-[--accent] bg-[--accent] text-[--on-accent]'
                          : 'border-[--border] hover:border-[--accent] bg-[--surface]'
                      }`}
                    >
                      {t.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium text-sm text-[--fg] ${
                            t.completed ? 'line-through text-[--secondary]' : ''
                          }`}
                        >
                          {t.title}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase border ${priorityColor(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-[--secondary] mt-1 line-clamp-1">
                          {t.description}
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono text-[--secondary]">
                        {t.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.start_time}
                          </span>
                        )}
                        <span>{t.category}</span>
                        {t.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            #{t.tags.join(' #')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingTask(t)}
                    className="p-1 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                    title="Edit task"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Today's Habits */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="label">Scheduled Habits ({habitRows.length})</span>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="text-xs font-semibold text-[--accent] hover:underline"
            >
              + New Habit
            </button>
          </div>

          {habitRows.length === 0 ? (
            <div className="py-12 text-center rounded border border-dashed border-border bg-[--surface]/50 p-6 space-y-2">
              <p className="font-serif text-lg text-[--secondary]">No habits scheduled for today.</p>
              <button
                onClick={() => setQuickAddOpen(true)}
                className="btn-primary !w-auto px-4 !h-8 text-xs font-semibold mx-auto mt-2"
              >
                Create Protocol
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {habitRows.map(({ habit: h, stats, isDone, currentValue, log }) => (
                <div
                  key={h.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDone
                      ? 'border-[--accent]/30 bg-[--accent]/5'
                      : 'border-border bg-[--surface] hover:border-[--accent]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xl shrink-0 mt-0.5">{h.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-[--fg] truncate">{h.name}</h4>
                          <span className="flex items-center gap-0.5 font-mono text-xs text-[--accent] font-bold">
                            <Flame className="h-3 w-3 fill-[--accent]" />
                            {stats.currentStreak}d
                          </span>
                        </div>
                        <p className="text-xs text-[--secondary] mt-0.5">
                          {h.category} {h.reminder_time ? `· ${h.reminder_time}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setNoteModalHabit({
                            id: h.id,
                            name: h.name,
                            notes: log?.notes || '',
                          })
                        }
                        className="p-1 text-[--secondary] hover:text-[--fg]"
                        title="Add check-in notes"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingHabit(h)}
                        className="p-1 text-[--secondary] hover:text-[--fg]"
                        title="Edit habit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Execution action: Checkbox or Numeric logger */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    {h.target_type === 'numeric' ? (
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <button
                            onClick={() =>
                              logHabitProgress(
                                h.id,
                                today,
                                Math.max(0, currentValue - (h.target_value <= 5 ? 0.5 : 1))
                              )
                            }
                            className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-[--muted] font-bold"
                          >
                            -
                          </button>
                          <span className="font-semibold text-sm">
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
                            className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-[--muted] font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => toggleHabit(h.id, today)}
                          className={`rounded px-2.5 py-1 text-xs font-semibold font-mono uppercase tracking-wider transition-colors border ${
                            isDone
                              ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                              : 'bg-[--surface] text-[--secondary] border-border hover:border-[--accent]'
                          }`}
                        >
                          {isDone ? 'Completed' : 'Complete Target'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-[--secondary]">
                          {isDone ? 'Completed for today' : 'Tap to mark completed'}
                        </span>
                        <button
                          onClick={() => toggleHabit(h.id, today)}
                          className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                            isDone
                              ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                              : 'bg-[--surface] text-[--secondary] border-border hover:border-[--accent]'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              Done
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Note modal */}
      {noteModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveHabitNote}
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
