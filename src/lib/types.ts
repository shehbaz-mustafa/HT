export type FormState = { error?: string; message?: string } | undefined;

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type RecurringSchedule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  created_at: string;
}

export interface Task {
  id: string;
  user_id?: string;
  list_id?: string | null;
  title: string;
  description: string;
  due_date: string | null; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  deadline: string | null;
  priority: PriorityLevel;
  category: string;
  tags: string[];
  recurring: RecurringSchedule;
  completed: boolean;
  completed_at: string | null;
  reminder_time: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitTargetType = 'boolean' | 'numeric';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type HabitCategory = string;

export interface Habit {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  frequency_type: HabitFrequency;
  days_of_week: number[]; // 0=Mon ... 6=Sun
  target_type: HabitTargetType;
  target_value: number;
  target_unit: string;
  reminder_time: string | null;
  status: HabitStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value: number;
  notes: string;
  created_at: string;
}

export interface HabitCalculatedStats {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
  completion_rate: number;
}

export interface UserSettings {
  display_name: string;
  email: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  reminder_lead_time: number;
  week_starts_on: number;
}
