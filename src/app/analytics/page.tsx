import { createClient } from '@/lib/supabase/server';
import { AnalyticsView } from '@/components/analytics-view';
import { SidebarNav } from '@/components/sidebar-nav';

function isoWeek(dateStr: string): { year: number; week: number } {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  const diff = d.getTime() - startOfWeek1.getTime();
  const week = Math.floor(diff / (7 * 86400000)) + 1;
  return { year: d.getUTCFullYear(), week };
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { period = '30d' } = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  let fromDate: string;
  if (period === 'quarter') {
    fromDate = addDays(today, -90);
  } else if (period === 'ytd') {
    fromDate = `${today.slice(0, 4)}-01-01`;
  } else if (period === 'year') {
    fromDate = `${parseInt(today.slice(0, 4)) - 1}-01-01`;
  } else {
    fromDate = addDays(today, -30);
  }

  const [habitsRes, checkInsRes, statsRes] = await Promise.all([
    supabase.from('habits').select('id,name,category').is('archived_at', null),
    supabase
      .from('check_ins')
      .select('habit_id,date,user_id')
      .gte('date', fromDate)
      .lte('date', today),
    supabase
      .from('habit_stats')
      .select('habit_id,current_streak,longest_streak,total_checkins'),
  ]);

  const habits = habitsRes.data ?? [];
  const checkIns = checkInsRes.data ?? [];
  const stats = statsRes.data ?? [];

  // KPI: Overall completion rate
  const totalHabits = habits.length;
  const periodDays =
    Math.round(
      (new Date(today).getTime() - new Date(fromDate).getTime()) / 86400000
    ) + 1;
  const possible = totalHabits * periodDays;
  const actual = checkIns.length;
  const overallCompletion =
    possible > 0 ? Math.round((actual / possible) * 1000) / 10 : 0;

  // Perfect days: days where all habits were checked
  const byDate = new Map<string, number>();
  checkIns.forEach((c) => byDate.set(c.date, (byDate.get(c.date) ?? 0) + 1));
  const perfectDays =
    totalHabits > 0
      ? [...byDate.values()].filter((v) => v >= totalHabits).length
      : 0;

  // Longest active streak
  const longestStreak = stats.reduce(
    (mx, s) => Math.max(mx, s.current_streak ?? 0),
    0
  );
  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const longestHabit =
    habits.find((h) => {
      const s = stats.find((st) => st.habit_id === h.id);
      return s && s.current_streak === longestStreak;
    })?.name ?? '';

  // Weekly completions — last 12 weeks
  const weekMap = new Map<string, number>();
  checkIns.forEach((c) => {
    const { year, week } = isoWeek(c.date);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
  });
  const weeklyData: { key: string; weekNum: number; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const ds = d.toISOString().slice(0, 10);
    const { year, week } = isoWeek(ds);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    if (!weeklyData.find((w) => w.key === key)) {
      weeklyData.push({ key, weekNum: week, count: weekMap.get(key) ?? 0 });
    }
  }

  // Category volume
  const catMap = new Map<string, { count: number; habitIds: Set<string> }>();
  checkIns.forEach((c) => {
    const h = habitMap.get(c.habit_id);
    const cat = h?.category ?? 'Uncategorized';
    const entry = catMap.get(cat) ?? { count: 0, habitIds: new Set() };
    entry.count++;
    if (h) entry.habitIds.add(h.id);
    catMap.set(cat, entry);
  });
  const totalCatCheckins = [...catMap.values()].reduce(
    (s, v) => s + v.count,
    0
  );
  const categoryVolume = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      count: v.count,
      pct:
        totalCatCheckins > 0
          ? Math.round((v.count / totalCatCheckins) * 100)
          : 0,
      protocols: v.habitIds.size,
    }))
    .sort((a, b) => b.count - a.count);

  // Milestones from habit_stats
  const milestones: { milestone: string; habit: string; achieved: string }[] =
    [];
  stats.forEach((s) => {
    const h = habitMap.get(s.habit_id);
    if (!h) return;
    if ((s.longest_streak ?? 0) >= 100)
      milestones.push({
        milestone: '100 Consecutive Days',
        habit: h.name,
        achieved: '—',
      });
    else if ((s.longest_streak ?? 0) >= 50)
      milestones.push({
        milestone: '50 Consecutive Days',
        habit: h.name,
        achieved: '—',
      });
    else if ((s.longest_streak ?? 0) >= 30)
      milestones.push({
        milestone: '30 Consecutive Days',
        habit: h.name,
        achieved: '—',
      });
    if ((s.total_checkins ?? 0) >= 250)
      milestones.push({
        milestone: '250 Total Check-ins',
        habit: h.name,
        achieved: '—',
      });
  });

  // Target ceiling
  const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);
  const targetCeiling = Math.ceil(maxWeekly / 5) * 5;
  const sorted = [...weeklyData.map((w) => w.count)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;

  // Day-of-week breakdown for temporal observation
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon=0...Sun=6
  const dowPossible = [0, 0, 0, 0, 0, 0, 0];
  checkIns.forEach((c) => {
    const d = new Date(`${c.date}T00:00:00Z`);
    const dow = (d.getUTCDay() + 6) % 7;
    dowCounts[dow]++;
  });
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(`${fromDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const dow = (d.getUTCDay() + 6) % 7;
    dowPossible[dow] += totalHabits;
  }
  const dowRates = dowCounts.map((c, i) =>
    dowPossible[i] > 0 ? c / dowPossible[i] : 0
  );
  const weekdayAvg =
    Math.round(
      ((dowRates[0] + dowRates[1] + dowRates[2] + dowRates[3]) / 4) * 1000
    ) / 10;
  const weekendAvg =
    Math.round(
      ((dowRates[4] + dowRates[5] + dowRates[6]) / 3) * 1000
    ) / 10;
  const bestDow =
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][
      dowRates.indexOf(Math.max(...dowRates))
    ];
  const bestDowRate = Math.round(Math.max(...dowRates) * 1000) / 10;

  const recordDate = today.replace(/-/g, '.');
  const periodLabel =
    (
      {
        '30d': 'Last 30 Days',
        quarter: 'Last Quarter',
        ytd: 'Year to Date',
        year: '2024 Full',
      } as Record<string, string>
    )[period] ?? 'Last 30 Days';

  return (
    <div className="flex min-h-screen">
      <SidebarNav recordDate={recordDate} />
      <main className="ml-44 flex-1 min-w-0">
        <AnalyticsView
          period={period}
          periodLabel={periodLabel}
          overallCompletion={overallCompletion}
          perfectDays={perfectDays}
          periodDays={periodDays}
          totalHabits={totalHabits}
          longestStreak={longestStreak}
          longestHabit={longestHabit}
          weeklyData={weeklyData}
          targetCeiling={targetCeiling}
          median={median}
          categoryVolume={categoryVolume}
          totalCatCheckins={totalCatCheckins}
          milestones={milestones}
          weekdayAvg={weekdayAvg}
          weekendAvg={weekendAvg}
          bestDow={bestDow}
          bestDowRate={bestDowRate}
          recordDate={recordDate}
        />
      </main>
    </div>
  );
}

