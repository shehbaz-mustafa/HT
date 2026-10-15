import { isoDow, addDays } from './dates';
import type { Habit, HabitLog } from './types';

/**
 * Checks whether a habit is scheduled for a given date (YYYY-MM-DD).
 */
export function isHabitScheduled(habit: Habit, dateStr: string): boolean {
  if (habit.status === 'paused' || habit.status === 'archived') {
    return false;
  }
  // If habit was created after this date, it wasn't scheduled yet
  const createdDate = habit.created_at ? habit.created_at.slice(0, 10) : '2000-01-01';
  if (dateStr < createdDate) {
    return false;
  }

  if (habit.frequency_type === 'daily') {
    return true;
  }

  const dowIndex = isoDow(dateStr) - 1; // 0=Mon ... 6=Sun

  if (habit.frequency_type === 'custom') {
    return (habit.days_of_week ?? []).includes(dowIndex);
  }

  if (habit.frequency_type === 'weekly') {
    // For weekly habits, treat Sunday (dowIndex 6) as the target anchor, or check if weekly goal met
    return dowIndex === 6;
  }

  return true;
}

/**
 * Checks whether a habit is completed on a given date according to its logs.
 */
export function isHabitCompleted(habit: Habit, log?: HabitLog | null): boolean {
  if (!log) return false;
  if (habit.target_type === 'numeric') {
    return (log.value ?? 0) >= (habit.target_value ?? 1);
  }
  return !!log.completed;
}

/**
 * Calculates current streak, longest streak, and completion rate respecting schedule.
 */
export function calculateHabitStats(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: string // YYYY-MM-DD (typically today)
): {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  completionRate: number;
  completedToday: boolean;
} {
  const logMap = new Map<string, HabitLog>();
  logs.forEach((l) => {
    if (l.habit_id === habit.id) {
      logMap.set(l.date, l);
    }
  });

  const todayLog = logMap.get(referenceDate);
  const completedToday = isHabitCompleted(habit, todayLog);

  // 1. Current streak calculation
  let currentStreak = 0;
  let checkDate = referenceDate;
  const isScheduledToday = isHabitScheduled(habit, referenceDate);

  if (isScheduledToday && completedToday) {
    currentStreak = 1;
    checkDate = addDays(referenceDate, -1);
  } else if (!isScheduledToday) {
    // Not scheduled today, so streak is active if previous scheduled day was done
    checkDate = addDays(referenceDate, -1);
  } else {
    // Scheduled today, but not completed yet: streak is pending today, check if yesterday was completed
    checkDate = addDays(referenceDate, -1);
  }

  // Walk backwards up to 365 days
  let lookbackDays = 0;
  while (lookbackDays < 365) {
    const createdDate = habit.created_at ? habit.created_at.slice(0, 10) : '2000-01-01';
    if (checkDate < createdDate) {
      break;
    }

    if (isHabitScheduled(habit, checkDate)) {
      const log = logMap.get(checkDate);
      if (isHabitCompleted(habit, log)) {
        currentStreak++;
      } else {
        // Missed a past scheduled day, streak ends
        break;
      }
    }
    checkDate = addDays(checkDate, -1);
    lookbackDays++;
  }

  // 2. Longest streak & total completion rate
  // Walk from habit creation (or 180 days ago) to referenceDate forward
  const createdDate = habit.created_at ? habit.created_at.slice(0, 10) : addDays(referenceDate, -180);
  const startDate = createdDate < addDays(referenceDate, -365) ? addDays(referenceDate, -365) : createdDate;

  let walkDate = startDate;
  let runningStreak = 0;
  let longestStreak = 0;
  let totalScheduled = 0;
  let totalCheckins = 0;

  while (walkDate <= referenceDate) {
    if (isHabitScheduled(habit, walkDate)) {
      totalScheduled++;
      const log = logMap.get(walkDate);
      if (isHabitCompleted(habit, log)) {
        runningStreak++;
        totalCheckins++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        // Don't break running streak if it's today and not yet done
        if (walkDate !== referenceDate) {
          runningStreak = 0;
        }
      }
    }
    walkDate = addDays(walkDate, 1);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  const completionRate = totalScheduled > 0
    ? Math.round((totalCheckins / totalScheduled) * 100)
    : 0;

  return {
    currentStreak,
    longestStreak,
    totalCheckins,
    completionRate,
    completedToday,
  };
}
