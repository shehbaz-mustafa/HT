import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isoDow, localDate, longDate, weekOf } from '@/lib/dates';
import { TodayView, type Row } from '@/components/today-view';

type HabitRow = { id: string; name: string; category: string | null; frequency_type: 'daily' | 'weekly' | 'custom'; days_of_week: number[]; reminder_time: string | null };

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
  const today = localDate(profile?.timezone ?? 'UTC');
  const dates = weekOf(today);
  const [habits, checks, stats] = await Promise.all([
    supabase.from('habits').select('id,name,category,frequency_type,days_of_week,reminder_time').is('archived_at', null).order('position').order('created_at'),
    supabase.from('check_ins').select('habit_id,date').gte('date', dates[0]).lte('date', dates[6]),
    supabase.from('habit_stats').select('habit_id,current_streak'),
  ]);
  if (habits.error || checks.error || stats.error) throw new Error('load failed');
  const done = new Set((checks.data ?? []).map((c) => `${c.habit_id}|${c.date}`));
  const streaks = new Map((stats.data ?? []).map((s) => [s.habit_id as string, s.current_streak as number]));
  const scheduled = (h: HabitRow, d: string) => h.frequency_type !== 'custom' || h.days_of_week.includes(isoDow(d));
  const rows: Row[] = ((habits.data ?? []) as HabitRow[]).map((h) => ({
    id: h.id,
    name: h.name,
    category: h.category,
    time: h.reminder_time ? h.reminder_time.slice(0, 5) : null,
    weekly: h.frequency_type === 'weekly',
    scheduledToday: scheduled(h, today),
    streak: streaks.get(h.id) ?? 0,
    done: done.has(`${h.id}|${today}`),
    week: dates.map((d) => ({ date: d, scheduled: scheduled(h, d), done: done.has(`${h.id}|${d}`) })),
  }));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <TodayView rows={rows} today={today} dates={dates} title={longDate(today)} />
    </div>
  );
}

