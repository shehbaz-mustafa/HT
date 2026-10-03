'use client';
import { useOptimistic, useState, useTransition } from 'react';
import { toggleCheckIn } from '@/actions/check-ins';

export type Row = {
  id: string; name: string; category: string | null; time: string | null; weekly: boolean;
  scheduledToday: boolean; streak: number; done: boolean; week: { date: string; scheduled: boolean; done: boolean }[];
};
const sq = (on: boolean, cls = 'h-2.5 w-2.5') => <span className={`inline-block border ${cls} ${on ? 'border-accent bg-accent' : 'border-border'}`} />;

export function TodayView({ rows, today, dates, title }: { rows: Row[]; today: string; dates: string[]; title: string }) {
  const [opt, setOpt] = useOptimistic(rows, (cur, id: string) =>
    cur.map((r) => (r.id === id ? { ...r, done: !r.done, week: r.week.map((w) => (w.date === today ? { ...w, done: !r.done } : w)) } : r)));
  const [, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const list = opt.filter((r) => r.scheduledToday);
  const n = list.length, dn = list.filter((r) => r.done).length;
  const toggle = (r: Row) => start(async () => {
    setErr(null);
    setOpt(r.id);
    const res = await toggleCheckIn({ habitId: r.id, date: today, checked: !r.done });
    if (res.error) setErr(res.error);
  });
  return (
    <>
      <header className="border-b border-border pb-6">
        <span className="label">Logbook / Today</span>
        <h1 className="mt-1 text-4xl tracking-tight">{title}</h1>
      </header>
      <section className="grid border-b border-border md:grid-cols-3">
        <div className="flex flex-col gap-4 bg-surface p-6 md:border-r md:border-border">
          <span className="label">Habits completed today{n ? ` · ${((dn / n) * 100).toFixed(1)}%` : ''}</span>
          <span className="tnum font-mono text-3xl font-medium">{dn} / {n}</span>
          <div className="h-1 bg-border"><div className="h-full bg-accent" style={{ width: `${n ? (dn / n) * 100 : 0}%` }} /></div>
        </div>
        <div className="p-6 md:col-span-2">
          <span className="label">This week</span>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {dates.map((d, i) => {
              const sch = opt.filter((r) => r.week[i].scheduled), c = sch.filter((r) => r.week[i].done).length, isToday = d === today;
              return (
                <div key={d} className={`flex min-h-24 flex-col items-center gap-1 border p-1 ${isToday ? 'border-2 border-accent bg-muted' : 'border-border bg-surface'} ${d > today ? 'opacity-60' : ''}`}>
                  <span className="label">{'MTWTFSS'[i]}</span>
                  <span className="tnum font-mono text-sm font-medium">{Number(d.slice(8))}</span>
                  <div className="mt-1 grid grid-cols-2 gap-0.5">{sch.map((r) => <span key={r.id}>{sq(d <= today && r.week[i].done, 'h-2 w-2')}</span>)}</div>
                  <span className="tnum font-mono text-xs text-secondary">{d <= today && sch.length ? `${c}/${sch.length}` : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {err && <p role="alert" className="py-3 text-sm text-danger">{err}</p>}
      {list.length === 0 ? (
        <div className="py-16 text-center text-secondary"><p className="text-2xl">-</p><p>No habits scheduled today.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-muted">{['Done', 'Habit', 'Scheduled', 'Streak', 'Week (M-S)'].map((h) => <th key={h} className="label px-4 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const base = rows.find((x) => x.id === r.id)!;
                const streak = Math.max(0, base.streak + (r.done === base.done ? 0 : r.done ? 1 : -1));
                return (
                  <tr key={r.id} className="hover:bg-muted">
                    <td className="px-4 py-4">
                      <button onClick={() => toggle(r)} aria-pressed={r.done} aria-label={`Mark ${r.name} ${r.done ? 'not done' : 'done'}`}
                        className={`flex h-5 w-5 items-center justify-center border ${r.done ? 'border-accent bg-accent text-on-accent' : 'border-fg'}`}>
                        {r.done && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>}
                      </button>
                    </td>
                    <td className="px-4 py-4"><div className="font-medium">{r.name}</div><div className="text-xs text-secondary">{r.category}</div></td>
                    <td className="tnum px-4 py-4 font-mono text-xs">{r.time ?? ''}</td>
                    <td className="tnum px-4 py-4 font-mono text-xs"><b>{streak}</b> <span className="text-secondary">{r.weekly ? 'week' : 'day'} streak</span></td>
                    <td className="whitespace-nowrap px-4 py-4">{r.week.map((w) => <span key={w.date} className="mx-px">{sq(w.date <= today && w.done)}</span>)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

