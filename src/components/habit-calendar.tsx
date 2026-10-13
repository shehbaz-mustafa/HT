"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleCheckIn } from "@/actions/check-ins";

export type CalendarHabit = {
  id: string;
  name: string;
  category: string | null;
  time: string | null;
  frequency: "daily" | "weekly" | "custom";
};

export type CalendarDay = {
  date: string;
  inMonth: boolean;
  scheduledHabitIds: string[];
  doneHabitIds: string[];
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatMonth(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function HabitCalendar({
  month,
  today,
  days,
  habits,
  previousMonth,
  nextMonth,
}: {
  month: string;
  today: string;
  days: CalendarDay[];
  habits: CalendarHabit[];
  previousMonth: string;
  nextMonth: string;
}) {
  const initialDay =
    days.find((day) => day.date === today)?.date ??
    days.find((day) => day.inMonth)?.date ??
    today;
  const [selectedDate, setSelectedDate] = useState(initialDay);
  const [doneByDate, setDoneByDate] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(days.map((day) => [day.date, day.doneHabitIds])),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedDay = days.find((day) => day.date === selectedDate) ?? days[0];
  const doneForSelectedDate =
    doneByDate[selectedDay.date] ?? selectedDay.doneHabitIds;
  const scheduledHabits = habits.filter((habit) =>
    selectedDay.scheduledHabitIds.includes(habit.id),
  );
  const completedCount = scheduledHabits.filter((habit) =>
    doneForSelectedDate.includes(habit.id),
  ).length;
  const monthDays = days.filter((day) => day.inMonth && day.date <= today);
  const monthScheduled = monthDays.reduce(
    (total, day) => total + day.scheduledHabitIds.length,
    0,
  );
  const monthCompleted = monthDays.reduce(
    (total, day) =>
      total +
      (doneByDate[day.date] ?? day.doneHabitIds).filter((id) =>
        day.scheduledHabitIds.includes(id),
      ).length,
    0,
  );
  const completionRate = monthScheduled
    ? Math.round((monthCompleted / monthScheduled) * 100)
    : 0;

  function toggleHabit(habitId: string) {
    const date = selectedDay.date;
    const previous = doneByDate[date] ?? selectedDay.doneHabitIds;
    const checked = !previous.includes(habitId);
    const next = checked
      ? [...previous, habitId]
      : previous.filter((id) => id !== habitId);

    setError(null);
    setDoneByDate((current) => ({ ...current, [date]: next }));
    startTransition(async () => {
      const result = await toggleCheckIn({ habitId, date, checked });
      if (result.error) {
        setDoneByDate((current) => ({ ...current, [date]: previous }));
        setError(result.error);
      }
    });
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-surface p-5">
          <p className="label">Active habits</p>
          <p className="tnum mt-2 font-mono text-2xl">{habits.length}</p>
          <p className="mt-1 text-xs text-secondary">
            Routines in your logbook
          </p>
        </div>
        <div className="bg-surface p-5">
          <p className="label">Completed this month</p>
          <p className="tnum mt-2 font-mono text-2xl">
            {monthCompleted}
            <span className="text-secondary"> / {monthScheduled}</span>
          </p>
          <p className="mt-1 text-xs text-secondary">
            Scheduled check-ins through today
          </p>
        </div>
        <div className="bg-surface p-5">
          <p className="label">Monthly consistency</p>
          <p className="tnum mt-2 font-mono text-2xl">{completionRate}%</p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionRate}
            className="mt-2 h-1 bg-border"
            aria-label={`${completionRate}% monthly consistency`}
          >
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
        <section className="min-w-0 border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
            <Link
              href={`/habits?month=${previousMonth}`}
              aria-label={`Go to ${formatMonth(previousMonth)}`}
              className="flex h-9 w-9 items-center justify-center rounded border border-border text-lg hover:bg-muted"
            >
              <span aria-hidden="true">‹</span>
            </Link>
            <h2 className="text-xl">{formatMonth(month)}</h2>
            <Link
              href={`/habits?month=${nextMonth}`}
              aria-label={`Go to ${formatMonth(nextMonth)}`}
              className="flex h-9 w-9 items-center justify-center rounded border border-border text-lg hover:bg-muted"
            >
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-muted">
            {weekdays.map((weekday) => (
              <div key={weekday} className="py-2 text-center label">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const doneIds = doneByDate[day.date] ?? day.doneHabitIds;
              const done = day.scheduledHabitIds.filter((id) =>
                doneIds.includes(id),
              ).length;
              const isSelected = day.date === selectedDate;
              const isToday = day.date === today;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  aria-label={`${formatDate(day.date)}; ${done} of ${day.scheduledHabitIds.length} habits completed${isToday ? "; today" : ""}`}
                  aria-pressed={isSelected}
                  className={`flex min-h-[5.5rem] flex-col items-center gap-1 border-b border-r border-border p-1.5 text-left transition-colors sm:min-h-24 sm:items-start sm:p-2 ${
                    isSelected
                      ? "bg-muted ring-1 ring-inset ring-accent"
                      : "hover:bg-muted"
                  } ${!day.inMonth ? "text-secondary opacity-60" : ""} ${day.date > today ? "opacity-55" : ""}`}
                >
                  <span
                    className={`tnum flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs ${
                      isToday ? "bg-accent font-semibold text-on-accent" : ""
                    }`}
                  >
                    {Number(day.date.slice(8))}
                  </span>
                  {day.scheduledHabitIds.length > 0 ? (
                    <>
                      <span className="hidden text-[10px] text-secondary sm:block">
                        {done}/{day.scheduledHabitIds.length} done
                      </span>
                      <span className="flex gap-1 sm:hidden" aria-hidden="true">
                        {day.scheduledHabitIds.slice(0, 4).map((id) => (
                          <span
                            key={id}
                            className={`h-1.5 w-1.5 rounded-full ${doneIds.includes(id) ? "bg-accent" : "bg-border"}`}
                          />
                        ))}
                      </span>
                    </>
                  ) : (
                    <span className="hidden text-[10px] text-secondary sm:block">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-xs text-secondary">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Completed
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full border border-border" />
              Scheduled
            </span>
            <span className="ml-auto">Select a day to review its habits</span>
          </div>
        </section>

        <aside className="border border-border bg-surface">
          <div className="border-b border-border p-5">
            <p className="label">Daily record</p>
            <h2 className="mt-1 text-xl">{formatDate(selectedDay.date)}</h2>
            <p className="mt-2 text-sm text-secondary">
              {completedCount} of {scheduledHabits.length} scheduled habits
              complete
            </p>
            <div className="mt-3 h-1 bg-border">
              <div
                className="h-full bg-accent transition-[width]"
                style={{
                  width: `${scheduledHabits.length ? (completedCount / scheduledHabits.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="border-b border-border px-5 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
          {scheduledHabits.length === 0 ? (
            <div className="p-5 text-sm text-secondary">
              {habits.length
                ? "No habits scheduled for this day."
                : "No active habits yet."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {scheduledHabits.map((habit) => {
                const checked = doneForSelectedDate.includes(habit.id);
                const future = selectedDay.date > today;
                return (
                  <li
                    key={habit.id}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleHabit(habit.id)}
                      disabled={future || isPending}
                      aria-pressed={checked}
                      aria-label={`Mark ${habit.name} ${checked ? "incomplete" : "complete"}`}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        checked
                          ? "border-accent bg-accent text-on-accent"
                          : "border-fg hover:border-accent"
                      }`}
                    >
                      {checked && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6.5l2.5 2.5L10 3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${checked ? "text-secondary line-through" : ""}`}
                      >
                        {habit.name}
                      </p>
                      <p className="mt-0.5 text-xs text-secondary">
                        {habit.category ?? "Uncategorized"}
                        {habit.time ? ` · ${habit.time}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedDay.date > today && (
            <p className="border-t border-border px-5 py-3 text-xs text-secondary">
              Future dates are read-only.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
