'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { Task, Habit, PriorityLevel } from '@/lib/types';
import { isHabitScheduled, isHabitCompleted } from '@/lib/habit-logic';
import { isoDow, addDays, longDate, weekOf } from '@/lib/dates';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Flame,
  AlertCircle,
  Edit2,
  X,
  RotateCcw,
} from 'lucide-react';

type CalendarViewMode = 'month' | 'week' | 'day';

function getMonthDates(year: number, month: number): string[] {
  // month is 1-indexed (1=Jan, 10=Oct)
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const dow = isoDow(firstDay) - 1; // 0=Mon ... 6=Sun
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalSlots = Math.ceil((dow + daysInMonth) / 7) * 7;

  const start = new Date(Date.UTC(year, month - 1, 1));
  start.setUTCDate(start.getUTCDate() - dow);

  return Array.from({ length: totalSlots }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function CalendarView() {
  const {
    today,
    tasks,
    habits,
    habitLogs,
    toggleTask,
    toggleHabit,
    updateTask,
    createTask,
    setEditingTask,
    setEditingHabit,
  } = useStore();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Currently viewed year & month
  const [currentYear, setCurrentYear] = useState(() => Number(today.slice(0, 4)));
  const [currentMonth, setCurrentMonth] = useState(() => Number(today.slice(5, 7)));
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Quick add task inline on selected date
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState(today);

  // Month grid dates
  const monthGridDates = useMemo(() => {
    return getMonthDates(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Week view dates
  const weekDates = useMemo(() => {
    return weekOf(selectedDate);
  }, [selectedDate]);

  // Navigate forward/back
  const handlePrev = () => {
    if (viewMode === 'month') {
      if (currentMonth === 1) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      if (currentMonth === 12) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleGoToday = () => {
    setCurrentYear(Number(today.slice(0, 4)));
    setCurrentMonth(Number(today.slice(5, 7)));
    setSelectedDate(today);
  };

  const monthLabel = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  // Items for selected day
  const selectedDayTasks = tasks.filter((t) => t.due_date === selectedDate);
  const selectedDayHabits = habits.filter(
    (h) => h.status === 'active' && isHabitScheduled(h, selectedDate)
  );

  const selectedHabitRows = selectedDayHabits.map((h) => {
    const log = habitLogs.find((l) => l.habit_id === h.id && l.date === selectedDate);
    const isDone = isHabitCompleted(h, log);
    return { habit: h, log, isDone };
  });

  const handleInlineAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTaskTitle.trim()) return;
    createTask({
      title: inlineTaskTitle.trim(),
      due_date: selectedDate,
      priority: 'medium',
    });
    setInlineTaskTitle('');
  };

  const handleReschedule = (taskId: string) => {
    updateTask(taskId, { due_date: newDueDate });
    setRescheduleTaskId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label">Ledger / Schedule Planning</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
            Calendar & Planner
          </h1>
          <p className="mt-1 text-xs text-[--secondary]">
            Cross-reference tasks, due dates, and scheduled habit protocols.
          </p>
        </div>

        {/* View Mode segmented control */}
        <div className="flex items-center gap-1 bg-[--muted] p-1 rounded-md border border-border text-xs">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded px-3 py-1 font-semibold uppercase tracking-wider transition-colors ${
                viewMode === mode
                  ? 'bg-[--surface] text-[--fg] shadow-sm'
                  : 'text-[--secondary] hover:text-[--fg]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Navigation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-[--surface]">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded hover:bg-[--muted] text-[--fg] border border-border transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded hover:bg-[--muted] text-[--fg] border border-border transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="font-serif text-lg font-bold ml-2 text-[--fg]">
            {viewMode === 'month'
              ? monthLabel
              : viewMode === 'week'
              ? `Week of ${weekDates[0]}`
              : longDate(selectedDate)}
          </span>
        </div>

        <button
          onClick={handleGoToday}
          className="rounded border border-border px-3 py-1 text-xs font-semibold hover:bg-[--muted] transition-colors"
        >
          Jump to Today
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-8 space-y-4">
          {viewMode === 'month' && (
            <div className="rounded-lg border border-border bg-[--surface] overflow-hidden shadow-sm">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border bg-[--muted]/50 text-center py-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className="label font-bold text-[10px]">
                    {d}
                  </span>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border">
                {monthGridDates.map((dateStr) => {
                  const inCurrentMonth = dateStr.slice(5, 7) === String(currentMonth).padStart(2, '0');
                  const isCurrent = dateStr === today;
                  const isSelected = dateStr === selectedDate;

                  // Tasks for date
                  const dayTasks = tasks.filter((t) => t.due_date === dateStr);
                  const dayHabits = habits.filter(
                    (h) => h.status === 'active' && isHabitScheduled(h, dateStr)
                  );
                  const completedHabits = dayHabits.filter((h) =>
                    habitLogs.some((l) => l.habit_id === h.id && l.date === dateStr && isHabitCompleted(h, l))
                  ).length;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[96px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[--accent]/10 ring-2 ring-[--accent] z-10'
                          : inCurrentMonth
                          ? 'bg-[--surface] hover:bg-[--muted]/40'
                          : 'bg-[--muted]/25 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs font-semibold h-5 w-5 rounded flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[--accent] text-[--on-accent]'
                              : 'text-[--fg]'
                          }`}
                        >
                          {Number(dateStr.slice(8))}
                        </span>

                        {dayHabits.length > 0 && (
                          <span
                            className="font-mono text-[9px] text-[--secondary]"
                            title={`${completedHabits} of ${dayHabits.length} habits done`}
                          >
                            {completedHabits}/{dayHabits.length}
                          </span>
                        )}
                      </div>

                      {/* Items previews */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`rounded px-1.5 py-0.5 text-[10px] truncate border flex items-center gap-1 ${
                              t.completed
                                ? 'line-through opacity-50 bg-[--muted] border-border text-[--secondary]'
                                : t.priority === 'urgent'
                                ? 'bg-[--danger]/15 border-[--danger]/30 text-[--danger] font-semibold'
                                : 'bg-[--surface] border-border text-[--fg]'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                t.completed ? 'bg-[--secondary]' : 'bg-[--accent]'
                              }`}
                            />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}

                        {dayTasks.length > 2 && (
                          <span className="text-[9px] font-mono text-[--secondary] block text-center">
                            +{dayTasks.length - 2} more tasks
                          </span>
                        )}
                      </div>

                      {/* Habits indicator bar */}
                      {dayHabits.length > 0 && (
                        <div className="mt-1 flex items-center gap-0.5">
                          {dayHabits.slice(0, 5).map((h) => {
                            const done = habitLogs.some(
                              (l) => l.habit_id === h.id && l.date === dateStr && isHabitCompleted(h, l)
                            );
                            return (
                              <span
                                key={h.id}
                                className={`h-1.5 w-1.5 rounded-sm ${
                                  done ? 'bg-[--accent]' : 'bg-border'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDates.map((dateStr) => {
                const isCurrent = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayTasks = tasks.filter((t) => t.due_date === dateStr);
                const dayHabits = habits.filter(
                  (h) => h.status === 'active' && isHabitScheduled(h, dateStr)
                );

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`rounded-lg border p-3 cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? 'border-[--accent] bg-[--accent]/5 ring-1 ring-[--accent]'
                        : isCurrent
                        ? 'border-[--border] bg-[--muted]/40'
                        : 'border-border bg-[--surface] hover:bg-[--muted]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <span className="label text-[10px]">
                          {new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en', {
                            weekday: 'short',
                            timeZone: 'UTC',
                          })}
                        </span>
                        <p className="font-mono text-sm font-bold">{dateStr.slice(8)}</p>
                      </div>
                      {isCurrent && (
                        <span className="rounded bg-[--accent] text-[--on-accent] px-1.5 py-0.2 text-[9px] font-bold">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Task list for day */}
                    <div className="space-y-1.5">
                      <span className="label text-[9px]">Tasks ({dayTasks.length})</span>
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-1.5 rounded border text-xs truncate flex items-center gap-1.5 ${
                            t.completed ? 'line-through opacity-50 bg-[--muted]' : 'bg-[--surface]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              t.completed ? 'bg-[--secondary]' : 'bg-[--accent]'
                            }`}
                          />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Habit list for day */}
                    <div className="space-y-1.5">
                      <span className="label text-[9px]">Habits ({dayHabits.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {dayHabits.map((h) => {
                          const done = habitLogs.some(
                            (l) => l.habit_id === h.id && l.date === dateStr && isHabitCompleted(h, l)
                          );
                          return (
                            <span
                              key={h.id}
                              className={`h-6 w-6 rounded flex items-center justify-center text-xs border ${
                                done ? 'bg-[--accent]/20 border-[--accent]' : 'border-border'
                              }`}
                              title={`${h.name}: ${done ? 'Completed' : 'Not completed'}`}
                            >
                              {h.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="rounded-lg border border-border bg-[--surface] p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <span className="label">Day Agenda Inspector</span>
                <h2 className="text-2xl font-serif font-bold text-[--fg] mt-1">
                  {longDate(selectedDate)}
                </h2>
              </div>

              {/* Day's Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm font-sans">Tasks ({selectedDayTasks.length})</h3>
                </div>

                {selectedDayTasks.length === 0 ? (
                  <p className="text-xs text-[--secondary]">No tasks scheduled for this date.</p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {selectedDayTasks.map((t) => (
                      <div key={t.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleTask(t.id)}
                            className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                              t.completed
                                ? 'bg-[--accent] border-[--accent] text-[--on-accent]'
                                : 'border-border hover:border-[--accent]'
                            }`}
                          >
                            {t.completed && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-sm ${
                              t.completed ? 'line-through text-[--secondary]' : 'text-[--fg]'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-[--secondary] hover:text-[--fg]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected-Day Agenda Drawer / Inspector (Column 2) */}
        <div className="lg:col-span-4 rounded-lg border border-border bg-[--surface] p-5 space-y-5 shadow-sm sticky top-6">
          <div className="border-b border-border pb-3">
            <span className="label block">Selected Agenda</span>
            <h3 className="font-serif font-bold text-lg text-[--fg] mt-0.5">
              {longDate(selectedDate)}
            </h3>
            {selectedDate === today && (
              <span className="rounded bg-[--accent]/15 text-[--accent] px-2 py-0.2 text-[10px] font-mono font-bold uppercase mt-1 inline-block">
                Today
              </span>
            )}
          </div>

          {/* Quick inline task creation for selected date */}
          <form onSubmit={handleInlineAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="+ Task for this date..."
              value={inlineTaskTitle}
              onChange={(e) => setInlineTaskTitle(e.target.value)}
              className="input-base text-xs !py-1.5"
            />
            <button
              type="submit"
              disabled={!inlineTaskTitle.trim()}
              className="btn-primary !w-auto px-3 !h-8 text-xs font-semibold"
            >
              Add
            </button>
          </form>

          {/* Scheduled Tasks list */}
          <div className="space-y-3">
            <span className="label block">Tasks Due ({selectedDayTasks.length})</span>
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-[--secondary] italic">No tasks scheduled for this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded border border-border bg-[--surface] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <button
                          onClick={() => toggleTask(t.id)}
                          className={`mt-0.5 h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            t.completed
                              ? 'bg-[--accent] border-[--accent] text-[--on-accent]'
                              : 'border-border hover:border-[--accent]'
                          }`}
                        >
                          {t.completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                        <span
                          className={`font-medium ${
                            t.completed ? 'line-through text-[--secondary]' : 'text-[--fg]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setRescheduleTaskId(rescheduleTaskId === t.id ? null : t.id)}
                          className="text-[10px] text-[--accent] hover:underline"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-[--secondary] hover:text-[--fg]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Reschedule popup */}
                    {rescheduleTaskId === t.id && (
                      <div className="pt-2 border-t border-border flex items-center gap-2">
                        <input
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="input-base text-xs !py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleReschedule(t.id)}
                          className="btn-primary !w-auto px-2.5 !h-7 text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Habits list */}
          <div className="space-y-3 pt-3 border-t border-border">
            <span className="label block">Scheduled Habits ({selectedHabitRows.length})</span>
            {selectedHabitRows.length === 0 ? (
              <p className="text-xs text-[--secondary] italic">No habits scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedHabitRows.map(({ habit: h, isDone }) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2 rounded border border-border text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{h.icon}</span>
                      <span className="font-medium text-[--fg] truncate">{h.name}</span>
                    </div>

                    <button
                      onClick={() => toggleHabit(h.id, selectedDate)}
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                        isDone
                          ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                          : 'bg-[--surface] text-[--secondary] border-border hover:border-[--accent]'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="h-3 w-3 stroke-[2.5]" />
                          Done
                        </>
                      ) : (
                        'Mark Done'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
