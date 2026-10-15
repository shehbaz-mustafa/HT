import type { Habit, HabitLog, Task, TaskList, UserSettings } from '../types';
import { addDays, localDate } from '../dates';

export const INITIAL_SETTINGS: UserSettings = {
  display_name: 'Alex Morgan',
  email: 'alex@example.com',
  timezone: 'UTC',
  theme: 'light',
  notifications_enabled: true,
  reminder_lead_time: 15,
  week_starts_on: 1,
};

export const INITIAL_TASK_LISTS: TaskList[] = [
  { id: 'list-inbox', name: 'Inbox', color: '#5f5e5e', icon: 'inbox', position: 0, created_at: '2026-09-01T00:00:00Z' },
  { id: 'list-work', name: 'Deep Work', color: '#1f5c3f', icon: 'briefcase', position: 1, created_at: '2026-09-01T00:00:00Z' },
  { id: 'list-personal', name: 'Personal & Home', color: '#d97706', icon: 'home', position: 2, created_at: '2026-09-01T00:00:00Z' },
  { id: 'list-health', name: 'Vitality & Health', color: '#0d9488', icon: 'activity', position: 3, created_at: '2026-09-01T00:00:00Z' },
];

export function generateInitialTasks(today: string): Task[] {
  return [
    {
      id: 'task-1',
      list_id: 'list-work',
      title: 'Review and approve architecture RFC for task sync',
      description: 'Go through the database migration schema, check index performance and data consistency rules.',
      due_date: today,
      start_time: '10:00',
      deadline: `${today}T18:00:00Z`,
      priority: 'urgent',
      category: 'Work',
      tags: ['architecture', 'deepwork', 'rfc'],
      recurring: 'none',
      completed: false,
      completed_at: null,
      reminder_time: '09:45',
      position: 0,
      created_at: `${today}T08:00:00Z`,
      updated_at: `${today}T08:00:00Z`,
    },
    {
      id: 'task-2',
      list_id: 'list-work',
      title: 'Finalize quarterly performance indicators',
      description: 'Consolidate habit tracking and task completion velocity metrics for the executive summary.',
      due_date: today,
      start_time: '14:30',
      deadline: `${today}T17:00:00Z`,
      priority: 'high',
      category: 'Productivity',
      tags: ['planning', 'q4'],
      recurring: 'weekly',
      completed: false,
      completed_at: null,
      reminder_time: '14:00',
      position: 1,
      created_at: `${today}T08:30:00Z`,
      updated_at: `${today}T08:30:00Z`,
    },
    {
      id: 'task-3',
      list_id: 'list-health',
      title: 'Collect medical checkup results & hydration log',
      description: 'Check blood panels and update annual wellness ledger.',
      due_date: today,
      start_time: '16:00',
      deadline: null,
      priority: 'medium',
      category: 'Health',
      tags: ['wellness', 'health'],
      recurring: 'none',
      completed: true,
      completed_at: `${today}T11:20:00Z`,
      reminder_time: null,
      position: 2,
      created_at: `${today}T07:15:00Z`,
      updated_at: `${today}T11:20:00Z`,
    },
    {
      id: 'task-4',
      list_id: 'list-personal',
      title: 'Review monthly utility & subscription ledger',
      description: 'Audit cloud infrastructure expenses and recurring subscriptions.',
      due_date: addDays(today, -1), // Overdue task to demonstrate overdue flow!
      start_time: '11:00',
      deadline: `${addDays(today, -1)}T23:59:00Z`,
      priority: 'high',
      category: 'Personal',
      tags: ['finances', 'ledger'],
      recurring: 'monthly',
      completed: false,
      completed_at: null,
      reminder_time: '10:30',
      position: 3,
      created_at: `${addDays(today, -3)}T10:00:00Z`,
      updated_at: `${addDays(today, -1)}T10:00:00Z`,
    },
    {
      id: 'task-5',
      list_id: 'list-work',
      title: 'Prepare demo walkthrough for design team',
      description: 'Record end-to-end video verifying Stitch typography and layout precision.',
      due_date: addDays(today, 1),
      start_time: '11:00',
      deadline: null,
      priority: 'medium',
      category: 'Work',
      tags: ['design', 'walkthrough'],
      recurring: 'none',
      completed: false,
      completed_at: null,
      reminder_time: '10:45',
      position: 4,
      created_at: `${today}T09:00:00Z`,
      updated_at: `${today}T09:00:00Z`,
    },
    {
      id: 'task-6',
      list_id: 'list-inbox',
      title: 'Organize study notes on discrete mathematics',
      description: 'Archive chapter summary into knowledge repository.',
      due_date: addDays(today, 3),
      start_time: null,
      deadline: null,
      priority: 'low',
      category: 'Study',
      tags: ['study', 'math'],
      recurring: 'none',
      completed: false,
      completed_at: null,
      reminder_time: null,
      position: 5,
      created_at: `${today}T09:30:00Z`,
      updated_at: `${today}T09:30:00Z`,
    },
  ];
}

export function generateInitialHabits(today: string): Habit[] {
  const past60 = addDays(today, -60);
  return [
    {
      id: 'habit-water',
      name: 'Hydration Target (2.5L)',
      description: 'Maintain cognitive clarity and physical recovery through measured intake.',
      category: 'Health',
      icon: 'droplets',
      color: '#1f5c3f',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_type: 'numeric',
      target_value: 2.5,
      target_unit: 'litres',
      reminder_time: '08:00',
      status: 'active',
      position: 0,
      created_at: `${past60}T00:00:00Z`,
      updated_at: `${today}T00:00:00Z`,
    },
    {
      id: 'habit-reading',
      name: 'Read 25 Pages',
      description: 'Deep, uninterrupted book study without digital distraction.',
      category: 'Intellect',
      icon: 'book',
      color: '#0d9488',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_type: 'numeric',
      target_value: 25,
      target_unit: 'pages',
      reminder_time: '21:00',
      status: 'active',
      position: 1,
      created_at: `${past60}T00:00:00Z`,
      updated_at: `${today}T00:00:00Z`,
    },
    {
      id: 'habit-training',
      name: 'Strength & Conditioning',
      description: 'Heavy compound training or functional kettlebell intervals.',
      category: 'Fitness',
      icon: 'dumbbell',
      color: '#ba1a1a',
      frequency_type: 'custom',
      days_of_week: [0, 2, 4], // Mon, Wed, Fri
      target_type: 'boolean',
      target_value: 1,
      target_unit: 'session',
      reminder_time: '07:30',
      status: 'active',
      position: 2,
      created_at: `${past60}T00:00:00Z`,
      updated_at: `${today}T00:00:00Z`,
    },
    {
      id: 'habit-meditation',
      name: 'Morning Stillness & Breathwork',
      description: '15 minutes of quiet mental regulation before opening email.',
      category: 'Mind',
      icon: 'compass',
      color: '#d97706',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_type: 'boolean',
      target_value: 1,
      target_unit: 'session',
      reminder_time: '06:45',
      status: 'active',
      position: 3,
      created_at: `${past60}T00:00:00Z`,
      updated_at: `${today}T00:00:00Z`,
    },
    {
      id: 'habit-sleep',
      name: 'Lights out by 23:00',
      description: 'Ensure 8 hours of restorative circadian sleep.',
      category: 'Sleep',
      icon: 'moon',
      color: '#334155',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_type: 'boolean',
      target_value: 1,
      target_unit: 'session',
      reminder_time: '22:30',
      status: 'active',
      position: 4,
      created_at: `${past60}T00:00:00Z`,
      updated_at: `${today}T00:00:00Z`,
    },
  ];
}

export function generateInitialLogs(today: string, habits: Habit[]): HabitLog[] {
  const logs: HabitLog[] = [];
  const seed = 1234567;
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  // Generate 60 days of historical data
  for (let i = 60; i >= 1; i--) {
    const d = addDays(today, -i);
    habits.forEach((h) => {
      // High consistency rate (85%) so streaks are authentic
      const rate = h.id === 'habit-water' ? 0.95 : h.id === 'habit-reading' ? 0.88 : 0.82;
      if (rnd() < rate) {
        logs.push({
          id: `log-${h.id}-${d}`,
          habit_id: h.id,
          date: d,
          completed: true,
          value: h.target_type === 'numeric' ? h.target_value : 1,
          notes: i % 7 === 0 ? 'Felt great, maintained steady tempo.' : '',
          created_at: `${d}T20:00:00Z`,
        });
      }
    });
  }

  // Today's partial check-ins
  logs.push({
    id: `log-habit-water-${today}`,
    habit_id: 'habit-water',
    date: today,
    completed: false,
    value: 1.5, // 1.5L of 2.5L logged so far today
    notes: 'Morning glass + workout hydration flask',
    created_at: `${today}T11:00:00Z`,
  });

  logs.push({
    id: `log-habit-meditation-${today}`,
    habit_id: 'habit-meditation',
    date: today,
    completed: true,
    value: 1,
    notes: '15 min breathing exercise completed',
    created_at: `${today}T07:00:00Z`,
  });

  return logs;
}
