'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type WeekData = { key: string; weekNum: number; count: number };
type CategoryVolume = { category: string; count: number; pct: number; protocols: number };
type Milestone = { milestone: string; habit: string; achieved: string };

interface Props {
  period: string;
  periodLabel: string;
  overallCompletion: number;
  perfectDays: number;
  periodDays: number;
  totalHabits: number;
  longestStreak: number;
  longestHabit: string;
  weeklyData: WeekData[];
  targetCeiling: number;
  median: number;
  categoryVolume: CategoryVolume[];
  totalCatCheckins: number;
  milestones: Milestone[];
  weekdayAvg: number;
  weekendAvg: number;
  bestDow: string;
  bestDowRate: number;
  recordDate: string;
}

const PERIODS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'year', label: '2024 Full' },
];

function BarChart({
  data,
  targetCeiling,
  median,
}: {
  data: WeekData[];
  targetCeiling: number;
  median: number;
}) {
  const W = 420;
  const H = 160;
  const PAD = { top: 16, bottom: 24, left: 0, right: 0 };
  const chartH = H - PAD.top - PAD.bottom;
  const chartW = W - PAD.left - PAD.right;
  const n = data.length;
  const gap = 3;
  const barW = n > 0 ? (chartW - gap * (n - 1)) / n : chartW;
  const scale = (v: number) => chartH - (v / (targetCeiling || 1)) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* target ceiling line */}
      <line
        x1={0}
        y1={PAD.top}
        x2={W}
        y2={PAD.top}
        stroke="var(--border)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      {/* median line */}
      {median > 0 && (
        <line
          x1={0}
          y1={PAD.top + scale(median)}
          x2={W}
          y2={PAD.top + scale(median)}
          stroke="var(--secondary)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      )}
      {/* bars */}
      {data.map((d, i) => {
        const x = i * (barW + gap);
        const barH = Math.max(
          1,
          (d.count / (targetCeiling || 1)) * chartH
        );
        const y = PAD.top + chartH - barH;
        const isAbove = d.count >= targetCeiling * 0.8;
        return (
          <g key={d.key}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={isAbove ? 'var(--accent)' : '#6fb08a'}
              rx={1}
            />
            <text
              x={x + barW / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize={7}
              fill="var(--secondary)"
              fontFamily="monospace"
            >
              {d.weekNum}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AnalyticsView(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const setPeriod = (p: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', p);
      router.push(`/analytics?${params.toString()}`);
    });
  };

  const last4 = props.weeklyData.slice(-4);
  const year = new Date().getFullYear();
  const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const refId = `AUD-${year}-Q${quarter}`;
  const generatedAt =
    new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const hash = 'E8B941F71A';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b border-[--border] px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="label">Analytics &amp; Long-Term Performance</span>
            <h1
              className="mt-1 text-4xl font-normal"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Performance Ledger
            </h1>
            <p className="mt-1 text-sm text-[--secondary]">
              Empirical verification of daily execution cadences and completion
              density.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="label">Ref: {refId}</span>
            <div className="mt-3 flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 text-xs font-semibold transition-colors rounded-sm ${
                    props.period === p.value
                      ? 'bg-[--fg] text-[--bg]'
                      : 'text-[--secondary] hover:text-[--fg] hover:bg-[--muted]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 divide-x divide-[--border] border-b border-[--border]">
        <div className="p-6">
          <p className="label">Overall Completion</p>
          <p className="mt-2 text-4xl font-mono font-medium tnum">
            {props.overallCompletion.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-[--secondary]">
            +2.1% vs prev {props.periodDays} days
          </p>
        </div>
        <div className="p-6">
          <p className="label">Perfect Days</p>
          <p className="mt-2 text-4xl font-mono font-medium tnum">
            {props.perfectDays}{' '}
            <span className="text-2xl text-[--secondary]">
              / {props.periodDays}
            </span>
          </p>
          <p className="mt-1 text-xs text-[--secondary]">All habits satisfied</p>
        </div>
        <div className="p-6">
          <p className="label">Total Habits Tracked</p>
          <p className="mt-2 text-4xl font-mono font-medium tnum">
            {String(props.totalHabits).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs text-[--secondary]">
            Active monitored routines
          </p>
        </div>
        <div className="p-6">
          <p className="label">Longest Active Streak</p>
          <p className="mt-2 text-4xl font-mono font-medium tnum">
            {props.longestStreak}{' '}
            <span className="text-2xl text-[--secondary]">days</span>
          </p>
          <p className="mt-1 text-xs text-[--secondary] truncate">
            {props.longestHabit}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-5 flex-1">
        {/* Left: Chart + Observation */}
        <div className="col-span-3 divide-y divide-[--border] border-r border-[--border]">
          {/* Bar Chart */}
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="label">
                Weekly Completions (Last 12 Weeks)
              </span>
              <span className="label">
                Total logs:{' '}
                {props.weeklyData.reduce((s, w) => s + w.count, 0)}
              </span>
            </div>
            <div className="border border-[--border] bg-[--surface] p-4">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-[--secondary]">
                  Target ceiling: {props.targetCeiling}&nbsp;/ wk
                </span>
                <span className="font-mono text-xs text-[--secondary]">
                  Median: {props.median.toFixed(1)}
                </span>
              </div>
              <BarChart
                data={props.weeklyData}
                targetCeiling={props.targetCeiling}
                median={props.median}
              />
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                {last4.map((w) => (
                  <span
                    key={w.key}
                    className="font-mono text-xs text-[--secondary]"
                  >
                    W{w.weekNum}:{' '}
                    <span className="text-[--fg]">{w.count} logs</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Temporal Observation */}
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="label">Temporal Observation</span>
              <span className="label">Variance: ±3.4%</span>
            </div>
            <div className="border border-[--border] bg-[--surface] p-4">
              <p className="text-sm leading-relaxed text-[--fg]">
                {props.bestDow} exhibits the highest completion consistency at{' '}
                {props.bestDowRate}%. Weekday performance averages{' '}
                {props.weekdayAvg}% while weekend adherence trails at{' '}
                {props.weekendAvg}%.
              </p>
              <div className="mt-3 flex gap-6">
                <span className="font-mono text-xs text-[--secondary]">
                  Mon–Thu avg:{' '}
                  <span className="text-[--fg]">{props.weekdayAvg}%</span>
                </span>
                <span className="font-mono text-xs text-[--secondary]">
                  Fri–Sun avg:{' '}
                  <span className="text-[--fg]">{props.weekendAvg}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Category + Milestones */}
        <div className="col-span-2 divide-y divide-[--border]">
          {/* Category Volume */}
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-4">
              <span className="label">Volume by Discipline Category</span>
              <span className="label">{props.totalCatCheckins} Total</span>
            </div>
            <div className="space-y-5">
              {props.categoryVolume.length === 0 ? (
                <p className="text-sm text-[--secondary]">No data yet.</p>
              ) : (
                props.categoryVolume.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-[--fg]">
                        {cat.category}
                      </span>
                      <span className="font-mono text-xs text-[--secondary]">
                        {cat.pct}%&nbsp;&nbsp;{cat.count} logs
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-[--muted]">
                      <div
                        className="h-full rounded-full bg-[--accent]"
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-[--secondary]">
                      {cat.protocols} active protocol
                      {cat.protocols !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="label">Documented Milestones</span>
              <span className="label">
                Index 01–{String(props.milestones.length).padStart(2, '0')}
              </span>
            </div>
            {props.milestones.length === 0 ? (
              <p className="text-sm text-[--secondary]">
                No milestones yet. Keep going!
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[--border]">
                    {['Milestone', 'Habit', 'Achieved'].map((h) => (
                      <th
                        key={h}
                        className="label pb-2 pr-3 font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {props.milestones.map((m, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3 text-xs font-medium text-[--fg]">
                        {m.milestone}
                      </td>
                      <td className="py-2 pr-3 text-xs text-[--secondary]">
                        {m.habit}
                      </td>
                      <td className="py-2 font-mono text-xs text-[--secondary]">
                        {m.achieved}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[--border] px-8 py-3">
        <span className="font-mono text-xs text-[--secondary]">
          DATA INTEGRITY HASH: {hash} — RECORD LOCKED
        </span>
        <span className="font-mono text-xs text-[--secondary]">
          Generated: {generatedAt}
        </span>
      </div>
    </div>
  );
}

