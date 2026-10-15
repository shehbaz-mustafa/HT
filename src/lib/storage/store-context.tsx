'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Task, TaskList, Habit, HabitLog, UserSettings, PriorityLevel } from '../types';
import { localDate, addDays } from '../dates';
import {
  INITIAL_SETTINGS,
  INITIAL_TASK_LISTS,
  generateInitialTasks,
  generateInitialHabits,
  generateInitialLogs,
} from './mock-data';
import { calculateHabitStats, isHabitScheduled, isHabitCompleted } from '../habit-logic';

export interface NotificationItem {
  id: string;
  type: 'task' | 'habit';
  title: string;
  time: string;
  isOverdue?: boolean;
}

interface StoreContextType {
  today: string;
  tasks: Task[];
  taskLists: TaskList[];
  habits: Habit[];
  habitLogs: HabitLog[];
  settings: UserSettings;
  isLoaded: boolean;

  // Task actions
  createTask: (data: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (reordered: Task[]) => void;

  // Task list actions
  createTaskList: (data: { name: string; color?: string; icon?: string }) => TaskList;
  updateTaskList: (id: string, updates: Partial<TaskList>) => void;
  deleteTaskList: (id: string) => void;

  // Habit actions
  createHabit: (data: Partial<Habit> & { name: string }) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  logHabitProgress: (habitId: string, date: string, value: number, notes?: string) => void;

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetData: () => void;
  exportData: (format: 'json' | 'tasks-csv' | 'habits-csv') => void;
  importData: (json: string) => boolean;

  // Notifications
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  requestNotificationPermission: () => Promise<boolean>;

  // UI Modals
  isQuickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  isShortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'ht_ledger_data_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState<string>('2026-10-15');
  const [isLoaded, setIsLoaded] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [taskLists, setTaskLists] = useState<TaskList[]>(INITIAL_TASK_LISTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  // UI state
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isShortcutsOpen, setShortcutsOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Initialize
  useEffect(() => {
    const currentToday = localDate('UTC');
    setToday(currentToday);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.taskLists) setTaskLists(parsed.taskLists);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.habits) setHabits(parsed.habits);
        if (parsed.habitLogs) setHabitLogs(parsed.habitLogs);
      } else {
        // First-time seed
        const initTasks = generateInitialTasks(currentToday);
        const initHabits = generateInitialHabits(currentToday);
        const initLogs = generateInitialLogs(currentToday, initHabits);
        setTasks(initTasks);
        setHabits(initHabits);
        setHabitLogs(initLogs);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            settings: INITIAL_SETTINGS,
            taskLists: INITIAL_TASK_LISTS,
            tasks: initTasks,
            habits: initHabits,
            habitLogs: initLogs,
          })
        );
      }
    } catch (e) {
      console.error('Storage loading error:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Theme application
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ settings, taskLists, tasks, habits, habitLogs })
      );
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [settings, taskLists, tasks, habits, habitLogs, isLoaded]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((e.key === 'q' || e.key === 'Q' || e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setQuickAddOpen(false);
        setEditingTask(null);
        setEditingHabit(null);
        setShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task actions
  const createTask = useCallback((data: Partial<Task> & { title: string }): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title.trim(),
      description: data.description ?? '',
      due_date: data.due_date ?? today,
      start_time: data.start_time ?? null,
      deadline: data.deadline ?? null,
      priority: data.priority ?? 'medium',
      category: data.category ?? 'General',
      list_id: data.list_id ?? 'list-inbox',
      tags: data.tags ?? [],
      recurring: data.recurring ?? 'none',
      completed: false,
      completed_at: null,
      reminder_time: data.reminder_time ?? null,
      position: tasks.length,
      created_at: now,
      updated_at: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [tasks.length, today]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: now } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completed_at: nextCompleted ? now : null,
          updated_at: now,
        };
      })
    );
  }, []);

  const reorderTasks = useCallback((reordered: Task[]) => {
    setTasks(reordered.map((t, idx) => ({ ...t, position: idx })));
  }, []);

  // Task Lists
  const createTaskList = useCallback((data: { name: string; color?: string; icon?: string }): TaskList => {
    const newList: TaskList = {
      id: `list-${Date.now()}`,
      name: data.name.trim(),
      color: data.color ?? '#1f5c3f',
      icon: data.icon ?? 'folder',
      position: taskLists.length,
      created_at: new Date().toISOString(),
    };
    setTaskLists((prev) => [...prev, newList]);
    return newList;
  }, [taskLists.length]);

  const updateTaskList = useCallback((id: string, updates: Partial<TaskList>) => {
    setTaskLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const deleteTaskList = useCallback((id: string) => {
    setTaskLists((prev) => prev.filter((l) => l.id !== id));
    // Move tasks in deleted list to inbox
    setTasks((prev) => prev.map((t) => (t.list_id === id ? { ...t, list_id: 'list-inbox' } : t)));
  }, []);

  // Habit Actions
  const createHabit = useCallback((data: Partial<Habit> & { name: string }): Habit => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      description: data.description ?? '',
      category: data.category ?? 'Personal',
      icon: data.icon ?? '🎯',
      color: data.color ?? '#1f5c3f',
      frequency_type: data.frequency_type ?? 'daily',
      days_of_week: data.days_of_week ?? [0, 1, 2, 3, 4, 5, 6],
      target_type: data.target_type ?? 'boolean',
      target_value: data.target_value ?? 1,
      target_unit: data.target_unit ?? 'times',
      reminder_time: data.reminder_time ?? null,
      status: 'active',
      position: habits.length,
      created_at: now,
      updated_at: now,
    };
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, [habits.length]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const now = new Date().toISOString();
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates, updated_at: now } : h))
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitLogs((prev) => prev.filter((l) => l.habit_id !== id));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    updateHabit(id, { status: 'archived' });
  }, [updateHabit]);

  const toggleHabit = useCallback((habitId: string, forDate?: string) => {
    const targetDate = forDate ?? today;
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setHabitLogs((prev) => {
      const existing = prev.find((l) => l.habit_id === habitId && l.date === targetDate);
      if (existing) {
        const nextDone = !existing.completed;
        const nextVal = nextDone ? habit.target_value : 0;
        return prev.map((l) =>
          l.id === existing.id ? { ...l, completed: nextDone, value: nextVal } : l
        );
      } else {
        const newLog: HabitLog = {
          id: `log-${habitId}-${targetDate}`,
          habit_id: habitId,
          date: targetDate,
          completed: true,
          value: habit.target_value ?? 1,
          notes: '',
          created_at: new Date().toISOString(),
        };
        return [...prev, newLog];
      }
    });
  }, [habits, today]);

  const logHabitProgress = useCallback(
    (habitId: string, date: string, value: number, notes?: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const isCompleted = habit.target_type === 'numeric'
        ? value >= (habit.target_value ?? 1)
        : value > 0;

      setHabitLogs((prev) => {
        const existing = prev.find((l) => l.habit_id === habitId && l.date === date);
        if (existing) {
          return prev.map((l) =>
            l.id === existing.id
              ? {
                  ...l,
                  value: Math.max(0, value),
                  completed: isCompleted,
                  notes: notes !== undefined ? notes : l.notes,
                }
              : l
          );
        } else {
          const newLog: HabitLog = {
            id: `log-${habitId}-${date}`,
            habit_id: habitId,
            date,
            completed: isCompleted,
            value: Math.max(0, value),
            notes: notes ?? '',
            created_at: new Date().toISOString(),
          };
          return [...prev, newLog];
        }
      });
    },
    [habits]
  );

  // Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetData = useCallback(() => {
    const currentToday = localDate('UTC');
    const initTasks = generateInitialTasks(currentToday);
    const initHabits = generateInitialHabits(currentToday);
    const initLogs = generateInitialLogs(currentToday, initHabits);

    setSettings(INITIAL_SETTINGS);
    setTaskLists(INITIAL_TASK_LISTS);
    setTasks(initTasks);
    setHabits(initHabits);
    setHabitLogs(initLogs);
  }, []);

  const exportData = useCallback((format: 'json' | 'tasks-csv' | 'habits-csv') => {
    let content = '';
    let mime = 'text/plain';
    let filename = `ht-ledger-${today}`;

    if (format === 'json') {
      content = JSON.stringify({ settings, taskLists, tasks, habits, habitLogs }, null, 2);
      mime = 'application/json';
      filename += '.json';
    } else if (format === 'tasks-csv') {
      const headers = ['ID', 'Title', 'Priority', 'Due Date', 'Category', 'Completed', 'Completed At'];
      const rows = tasks.map((t) => [
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.priority}"`,
        `"${t.due_date ?? ''}"`,
        `"${t.category}"`,
        `"${t.completed ? 'YES' : 'NO'}"`,
        `"${t.completed_at ?? ''}"`,
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mime = 'text/csv';
      filename += '-tasks.csv';
    } else if (format === 'habits-csv') {
      const headers = ['ID', 'Name', 'Category', 'Frequency', 'Target Type', 'Target Value', 'Status'];
      const rows = habits.map((h) => [
        `"${h.id}"`,
        `"${h.name.replace(/"/g, '""')}"`,
        `"${h.category}"`,
        `"${h.frequency_type}"`,
        `"${h.target_type}"`,
        `"${h.target_value} ${h.target_unit}"`,
        `"${h.status}"`,
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mime = 'text/csv';
      filename += '-habits.csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settings, taskLists, tasks, habits, habitLogs, today]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.taskLists)) setTaskLists(parsed.taskLists);
      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
      if (Array.isArray(parsed.habitLogs)) setHabitLogs(parsed.habitLogs);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  // Notifications calculation
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];

    // Overdue tasks
    tasks.forEach((t) => {
      if (!t.completed && t.due_date && t.due_date < today) {
        const id = `notif-overdue-${t.id}`;
        if (!dismissedNotifications.has(id)) {
          list.push({
            id,
            type: 'task',
            title: `Overdue: ${t.title}`,
            time: `Due on ${t.due_date}`,
            isOverdue: true,
          });
        }
      }
    });

    // Today's scheduled tasks with reminder
    tasks.forEach((t) => {
      if (!t.completed && t.due_date === today && t.reminder_time) {
        const id = `notif-today-task-${t.id}`;
        if (!dismissedNotifications.has(id)) {
          list.push({
            id,
            type: 'task',
            title: `Task reminder: ${t.title}`,
            time: `Scheduled for ${t.reminder_time}`,
          });
        }
      }
    });

    // Habits scheduled today with reminder
    habits.forEach((h) => {
      if (h.status === 'active' && isHabitScheduled(h, today) && h.reminder_time) {
        const isDone = habitLogs.some((l) => l.habit_id === h.id && l.date === today && isHabitCompleted(h, l));
        if (!isDone) {
          const id = `notif-habit-${h.id}`;
          if (!dismissedNotifications.has(id)) {
            list.push({
              id,
              type: 'habit',
              title: `Habit reminder: ${h.name}`,
              time: `Scheduled at ${h.reminder_time}`,
            });
          }
        }
      }
    });

    return list;
  }, [tasks, habits, habitLogs, today, dismissedNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedNotifications((prev) => new Set([...prev, id]));
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  return (
    <StoreContext.Provider
      value={{
        today,
        tasks,
        taskLists,
        habits,
        habitLogs,
        settings,
        isLoaded,
        createTask,
        updateTask,
        deleteTask,
        toggleTask,
        reorderTasks,
        createTaskList,
        updateTaskList,
        deleteTaskList,
        createHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        toggleHabit,
        logHabitProgress,
        updateSettings,
        resetData,
        exportData,
        importData,
        notifications,
        dismissNotification,
        requestNotificationPermission,
        isQuickAddOpen,
        setQuickAddOpen,
        editingTask,
        setEditingTask,
        editingHabit,
        setEditingHabit,
        isShortcutsOpen,
        setShortcutsOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
