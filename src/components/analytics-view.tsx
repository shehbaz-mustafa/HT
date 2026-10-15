'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storage/store-context';
import { calculateHabitStats, isHabitScheduled, isHabitCompleted } from '@/lib/habit-logic';
import { addDays, weekOf, isoDow } from '@/lib/dates';
import {
  Flame,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';

type AnalyticsPeriod = '7d' | '30d' | 'quarter' | 'ytd' | 'year';

export function AnalyticsView() {
  const { tasks, habits, habitLogs, today } = useStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  // Compute date range
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === 'quarter' ? 90 : 365;
  const fromDate = addDays(today, -periodDays + 1);

  // 1. Task metrics
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasksCount = tasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length;
  const tasksCompletedToday = tasks.filter((t) => t.completed && t.completed_at?.startsWith(today)).length;

  const currentWeek = weekOf(today);
  const tasksCompletedThisWeek = tasks.filter(
    (t) => t.completed && t.completed_at && t.completed_at.slice(0, 10) >= currentWeek[0] && t.completed_at.slice(0, 10) <= currentWeek[6]
  ).length;

  const currentMonthPrefix = today.slice(0, 7);
  const tasksCompletedThisMonth = tasks.filter(
    (t) => t.completed && t.completed_at?.startsWith(currentMonthPrefix)
  ).length;

  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // 2. Habit metrics
  const habitStatsList = habits.map((h) => ({
    habit: h,
    stats: calculateHabitStats(h, habitLogs, today),
  }));

  const bestStreak = habitStatsList.reduce((max, curr) => Math.max(max, curr.stats.currentStreak), 0);
  const longestEverStreak = habitStatsList.reduce((max, curr) => Math.max(max, curr.stats.longestStreak), 0);
  const overallHabitRate = habitStatsList.length > 0
    ? Math.round(habitStatsList.reduce((acc, c) => acc + c.stats.completionRate, 0) / habitStatsList.length)
    : 0;

  // Perfect days in period
  const perfectDaysCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < periodDays; i++) {
      const d = addDays(fromDate, i);
      const scheduled = habits.filter((h) => h.status === 'active' && isHabitScheduled(h, d));
      if (scheduled.length > 0) {
        const done = scheduled.filter((h) =>
          habitLogs.some((l) => l.habit_id === h.id && l.date === d && isHabitCompleted(h, l))
        );
        if (done.length === scheduled.length) {
          count++;
        }
      }
    }
    return count;
  }, [habits, habitLogs, fromDate, periodDays]);

  // Weekly completions bar chart (last 12 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { weekLabel: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const refDate = addDays(today, -i * 7);
      const wDays = weekOf(refDate);
      const count = habitLogs.filter(
        (l) => l.completed && l.date >= wDays[0] && l.date <= wDays[6]
      ).length;
      weeks.push({ weekLabel: `W${wDays[0].slice(5)}`, count });
    }
    return weeks;
  }, [habitLogs, today]);

  const maxWeeklyCount = Math.max(...weeklyData.map((w) => w.count), 1);
  const targetCeiling = Math.ceil(maxWeeklyCount / 5) * 5 || 10;

  // Category volume breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; habits: Set<string> }>();
    habitLogs.forEach((l) => {
      if (!l.completed || l.date < fromDate || l.date > today) return;
      const h = habits.find((item) => item.id === l.habit_id);
      const cat = h?.category || 'General';
      const curr = map.get(cat) || { count: 0, habits: new Set() };
      curr.count++;
      if (h) curr.habits.add(h.id);
      map.set(cat, curr);
    });

    const total = Array.from(map.values()).reduce((sum, v) => sum + v.count, 0);
    return Array.from(map.entries())
      .map(([cat, v]) => ({
        category: cat,
        count: v.count,
        pct: total > 0 ? Math.round((v.count / total) * 100) : 0,
        protocols: v.habits.size,
      }))
      .sort((a, b) => b.count - a.count);
  }, [habitLogs, habits, fromDate, today]);

  // Activity Heatmap: 20 weeks (140 days)
  const heatmapData = useMemo(() => {
    const totalDays = 140;
    const start = addDays(today, -totalDays + 1);
    const days: { date: string; intensity: number; count: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const d = addDays(start, i);
      const habitCheckins = habitLogs.filter((l) => l.date === d && l.completed).length;
      const tasksCompleted = tasks.filter((t) => t.completed && t.completed_at?.startsWith(d)).length;
      const totalActivity = habitCheckins + tasksCompleted;

      let intensity = 0;
      if (totalActivity >= 5) intensity = 4;
      else if (totalActivity >= 3) intensity = 3;
      else if (totalActivity >= 2) intensity = 2;
      else if (totalActivity >= 1) intensity = 1;

      days.push({ date: d, intensity, count: totalActivity });
    }
    return days;
  }, [habitLogs, tasks, today]);

  // Recent activity timeline
  const recentTimeline = useMemo(() => {
    const events: { id: string; type: 'habit' | 'task'; title: string; time: string; date: string }[] = [];

    // Recent habit logs
    habitLogs.slice(-10).reverse().forEach((l) => {
      const h = habits.find((item) => item.id === l.habit_id);
      if (h && l.completed) {
        events.push({
          id: l.id,
          type: 'habit',
          title: `Completed protocol: ${h.name}${l.value && h.target_type === 'numeric' ? ` (${l.value} ${h.target_unit})` : ''}`,
          time: l.created_at ? l.created_at.slice(11, 16) : 'Logged',
          date: l.date,
        });
      }
    });

    // Recent tasks completed
    tasks.filter((t) => t.completed && t.completed_at).slice(-8).forEach((t) => {
      events.push({
        id: `t-${t.id}`,
        type: 'task',
        title: `Finished task: ${t.title}`,
        time: t.completed_at ? t.completed_at.slice(11, 16) : 'Recorded',
        date: t.completed_at ? t.completed_at.slice(0, 10) : today,
      });
    });

    return events.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 12);
  }, [habitLogs, tasks, habits, today]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label">Ledger / Performance Analysis</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
            Analytics & Insights
          </h1>
          <p className="mt-1 text-xs text-[--secondary]">
            Quantifiable consistency metrics, volume analysis, and historical activity heatmaps.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-[--muted] p-1 rounded-md border border-border text-xs">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'quarter', label: 'Quarter' },
            { id: 'year', label: 'Year' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as AnalyticsPeriod)}
              className={`rounded px-3 py-1 font-semibold uppercase tracking-wider transition-colors ${
                period === item.id
                  ? 'bg-[--surface] text-[--fg] shadow-sm'
                  : 'text-[--secondary] hover:text-[--fg]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-[--surface] space-y-1">
          <span className="label block">Tasks Completed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold">{completedTasks.length}</span>
            <span className="font-mono text-xs text-[--secondary]">/ {tasks.length}</span>
          </div>
          <span className="text-[11px] text-[--secondary] block">
            {tasksCompletedThisWeek} this week · {tasksCompletedToday} today
          </span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface] space-y-1">
          <span className="label block">Task Completion Rate</span>
          <span className="font-mono text-2xl font-bold text-[--accent] mt-1 block">
            {taskCompletionRate}%
          </span>
          <span className="text-[11px] text-[--danger] block">
            {overdueTasksCount} overdue backlog
          </span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface] space-y-1">
          <span className="label block">Habit Consistency</span>
          <span className="font-mono text-2xl font-bold text-[--accent] mt-1 block">
            {overallHabitRate}%
          </span>
          <span className="text-[11px] text-[--secondary] block">
            {perfectDaysCount} perfect days in period
          </span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-[--surface] space-y-1">
          <span className="label block">Streak Records</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame className="h-5 w-5 fill-current" />
              {bestStreak}d
            </span>
            <span className="font-mono text-xs text-[--secondary]">Best {longestEverStreak}d</span>
          </div>
          <span className="text-[11px] text-[--secondary] block">Schedule-respected continuity</span>
        </div>
      </section>

      {/* Weekly Completions Bar Chart & Category Volume */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-7 rounded-lg border border-border bg-[--surface] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="label block">Volume Cadence</span>
              <h3 className="font-bold text-sm">Weekly Check-in Completions (Last 12 Weeks)</h3>
            </div>
            <span className="font-mono text-xs text-[--secondary]">Ceiling: {targetCeiling}</span>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-4 pb-2 px-1">
            {weeklyData.map((w, idx) => {
              const heightPct = Math.min(100, Math.max(6, Math.round((w.count / targetCeiling) * 100)));
              const isLatest = idx === weeklyData.length - 1;

              return (
                <div key={w.weekLabel} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-[--secondary] opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.count}
                  </span>
                  <div className="w-full bg-[--muted] rounded-sm overflow-hidden flex flex-col justify-end h-32">
                    <div
                      className={`w-full rounded-sm transition-all duration-300 ${
                        isLatest
                          ? 'bg-[--accent]'
                          : 'bg-[--accent]/60 hover:bg-[--accent]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-[--secondary] truncate max-w-full">
                    {w.weekLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 rounded-lg border border-border bg-[--surface] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="label block">Focus Allocation</span>
              <h3 className="font-bold text-sm">Completions by Category</h3>
            </div>
            <span className="font-mono text-xs text-[--secondary]">{period}</span>
          </div>

          {categoryStats.length === 0 ? (
            <p className="text-xs text-[--secondary] py-8 text-center">No completions logged in this period.</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[--fg]">{cat.category}</span>
                    <span className="font-mono text-[--secondary]">
                      {cat.count} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[--muted] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[--accent] rounded-full transition-all duration-300"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 140-Day Activity Heatmap Matrix */}
      <section className="rounded-lg border border-border bg-[--surface] p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="label block">Consistency Heatmap</span>
            <h3 className="font-bold text-sm">Combined Protocol & Task Execution Activity (Last 20 Weeks)</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[--secondary]">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-[--muted] border border-border inline-block" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[--accent]/30 inline-block" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[--accent]/60 inline-block" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[--accent] inline-block" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {heatmapData.map((d) => {
              const bg =
                d.intensity === 4
                  ? 'bg-[--accent]'
                  : d.intensity === 3
                  ? 'bg-[--accent]/70'
                  : d.intensity === 2
                  ? 'bg-[--accent]/40'
                  : d.intensity === 1
                  ? 'bg-[--accent]/20'
                  : 'bg-[--muted] border border-border/50';

              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} completed actions`}
                  className={`h-3 w-3 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bg}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Habit Streaks Leaderboard & Recent Activity Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-6 rounded-lg border border-border bg-[--surface] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="label block">Leaderboard</span>
              <h3 className="font-bold text-sm">Habit Continuity Streaks</h3>
            </div>
            <span className="font-mono text-xs text-[--secondary]">{habits.length} protocols</span>
          </div>

          <div className="divide-y divide-border">
            {habitStatsList
              .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
              .map(({ habit: h, stats }) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{h.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-[--fg] truncate">{h.name}</p>
                      <p className="text-[10px] text-[--secondary] font-mono">{h.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-[--accent] flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      {stats.currentStreak}d
                    </span>
                    <span className="font-mono text-[--secondary]">
                      Best: {stats.longestStreak}d
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Timeline */}
        <div className="lg:col-span-6 rounded-lg border border-border bg-[--surface] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="label block">Audit Trail</span>
              <h3 className="font-bold text-sm">Recent Activity Log</h3>
            </div>
            <Activity className="h-4 w-4 text-[--secondary]" />
          </div>

          {recentTimeline.length === 0 ? (
            <p className="text-xs text-[--secondary] py-8 text-center">No recent records found.</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {recentTimeline.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded border border-border bg-[--surface] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        item.type === 'habit' ? 'bg-[--accent]' : 'bg-amber-600'
                      }`}
                    />
                    <span className="truncate text-[--fg] font-medium">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[--secondary] shrink-0">
                    {item.date} {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
