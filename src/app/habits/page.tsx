import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isoDow, localDate } from "@/lib/dates";
import {
  HabitCalendar,
  type CalendarDay,
  type CalendarHabit,
} from "@/components/habit-calendar";
import { SidebarNav } from "@/components/sidebar-nav";

type HabitRow = {
  id: string;
  name: string;
  category: string | null;
  frequency_type: "daily" | "weekly" | "custom";
  days_of_week: number[];
  reminder_time: string | null;
};

function monthDates(month: string): string[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = `${month}-01`;
  const firstDay = isoDow(first) - 1;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const numberOfDays = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const start = new Date(`${first}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - firstDay);

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function isValidMonth(value: string | undefined): value is string {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1000 && year <= 9999;
}

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function isScheduled(habit: HabitRow, date: string): boolean {
  if (habit.frequency_type === "daily") return true;
  if (habit.frequency_type === "weekly") return isoDow(date) === 7;
  return habit.days_of_week.includes(isoDow(date) - 1);
}

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const today = localDate(profile?.timezone ?? "UTC");
  const currentMonth = today.slice(0, 7);
  const requestedMonth = (await searchParams).month;
  const month = isValidMonth(requestedMonth) ? requestedMonth : currentMonth;
  const dates = monthDates(month);
  const [habitsResult, checksResult] = await Promise.all([
    supabase
      .from("habits")
      .select("id,name,category,frequency_type,days_of_week,reminder_time")
      .is("archived_at", null)
      .order("position")
      .order("created_at"),
    supabase
      .from("check_ins")
      .select("habit_id,date")
      .gte("date", dates[0])
      .lte("date", dates[dates.length - 1]),
  ]);

  if (habitsResult.error) throw new Error("Could not load habits.");
  if (checksResult.error) throw new Error("Could not load habit check-ins.");

  const habits = (habitsResult.data ?? []) as HabitRow[];
  const checkIns = checksResult.data ?? [];
  const checkedByDate = new Map<string, Set<string>>();
  checkIns.forEach(({ habit_id, date }) => {
    const checked = checkedByDate.get(date) ?? new Set<string>();
    checked.add(habit_id);
    checkedByDate.set(date, checked);
  });

  const days: CalendarDay[] = dates.map((date) => {
    const scheduled = habits.filter((habit) => isScheduled(habit, date));
    const checked = checkedByDate.get(date) ?? new Set<string>();
    return {
      date,
      inMonth: date.slice(0, 7) === month,
      scheduledHabitIds: scheduled.map((habit) => habit.id),
      doneHabitIds: scheduled
        .filter((habit) => checked.has(habit.id))
        .map((habit) => habit.id),
    };
  });

  const calendarHabits: CalendarHabit[] = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    category: habit.category,
    time: habit.reminder_time?.slice(0, 5) ?? null,
    frequency: habit.frequency_type,
  }));

  return (
    <div className="flex min-h-screen">
      <SidebarNav recordDate={today.replace(/-/g, ".")} />
      <main className="ml-44 min-w-0 flex-1">
        <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 md:px-8">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="label">Logbook / Habits</span>
              <h1 className="mt-1 text-4xl tracking-tight">Your habits</h1>
              <p className="mt-2 text-sm text-secondary">
                A clear view of your routines, one day at a time.
              </p>
            </div>
            <Link
              href={`/habits?month=${currentMonth}`}
              className="rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Today
            </Link>
          </header>

          <HabitCalendar
            key={month}
            month={month}
            today={today}
            days={days}
            habits={calendarHabits}
            previousMonth={shiftMonth(month, -1)}
            nextMonth={shiftMonth(month, 1)}
          />
        </div>
      </main>
    </div>
  );
}
