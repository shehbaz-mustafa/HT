'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { Habit, HabitFrequency, HabitTargetType, HabitStatus } from '@/lib/types';
import { calculateHabitStats, isHabitScheduled } from '@/lib/habit-logic';
import { addDays } from '@/lib/dates';
import { X, Trash2, Archive, Flame, Award, Calendar, Check, AlertTriangle } from 'lucide-react';

const ICONS = ['💧', '📖', '🏃', '🧘', '🏋️', '⚡', '🌙', '✍️', '🍎', '🎯', '🌿', '💻'];
const COLORS = [
  '#1f5c3f',
  '#0d9488',
  '#d97706',
  '#ba1a1a',
  '#4f46e5',
  '#7c3aed',
  '#475569',
];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitDrawer() {
  const {
    editingHabit,
    setEditingHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    habitLogs,
    today,
    toggleHabit,
  } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('💧');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [targetType, setTargetType] = useState<HabitTargetType>('boolean');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [targetUnit, setTargetUnit] = useState('times');
  const [reminderTime, setReminderTime] = useState('');
  const [status, setStatus] = useState<HabitStatus>('active');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setIcon(editingHabit.icon || '💧');
      setColor(editingHabit.color || COLORS[0]);
      setFrequency(editingHabit.frequency_type);
      setDaysOfWeek(editingHabit.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
      setTargetType(editingHabit.target_type || 'boolean');
      setTargetValue(editingHabit.target_value || 1);
      setTargetUnit(editingHabit.target_unit || 'times');
      setReminderTime(editingHabit.reminder_time || '');
      setStatus(editingHabit.status || 'active');
      setShowDeleteConfirm(false);
    }
  }, [editingHabit]);

  if (!editingHabit) return null;

  const stats = calculateHabitStats(editingHabit, habitLogs, today);

  const handleToggleDay = (idx: number) => {
    if (daysOfWeek.includes(idx)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== idx));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, idx].sort());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateHabit(editingHabit.id, {
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      icon,
      color,
      frequency_type: frequency,
      days_of_week: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : daysOfWeek,
      target_type: targetType,
      target_value: targetType === 'numeric' ? Number(targetValue) || 1 : 1,
      target_unit: targetType === 'numeric' ? targetUnit.trim() || 'times' : 'times',
      reminder_time: reminderTime || null,
      status,
    });

    setEditingHabit(null);
  };

  const handleDelete = () => {
    deleteHabit(editingHabit.id);
    setEditingHabit(null);
  };

  // Recent 14 days history inspect
  const recentDays = Array.from({ length: 14 }, (_, i) => addDays(today, -13 + i));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-full bg-[--surface] border-l border-border shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-[--muted]/40 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-full flex items-center justify-center text-lg shadow-sm"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
            >
              {icon}
            </span>
            <div>
              <span className="label block">Habit Protocol</span>
              <h2 className="text-base font-bold font-sans tracking-tight">{name || 'Habit Details'}</h2>
            </div>
          </div>
          <button
            onClick={() => setEditingHabit(null)}
            className="rounded p-1 text-[--secondary] hover:bg-[--muted] hover:text-[--fg]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 border-b border-border bg-[--muted]/20 text-center py-3 divide-x divide-border">
          <div className="px-2">
            <span className="label block">Streak</span>
            <span className="tnum font-mono text-lg font-bold text-[--accent] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 inline fill-[--accent]" />
              {stats.currentStreak}d
            </span>
          </div>
          <div className="px-2">
            <span className="label block">Longest</span>
            <span className="tnum font-mono text-lg font-bold flex items-center justify-center gap-1">
              <Award className="h-4 w-4 inline text-amber-600" />
              {stats.longestStreak}d
            </span>
          </div>
          <div className="px-2">
            <span className="label block">Total</span>
            <span className="tnum font-mono text-lg font-bold">
              {stats.totalCheckins}
            </span>
          </div>
          <div className="px-2">
            <span className="label block">Rate</span>
            <span className="tnum font-mono text-lg font-bold">
              {stats.completionRate}%
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
          <div>
            <label className="label block mb-1.5">Habit Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-base text-lg font-medium"
            />
          </div>

          <div>
            <label className="label block mb-1.5">Description & Intent</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this habit matters, rules for execution..."
              className="input-base text-sm resize-none"
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Icon / Emoji</label>
              <div className="flex flex-wrap gap-1">
                {ICONS.slice(0, 8).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`h-7 w-7 rounded text-sm flex items-center justify-center border transition-all ${
                      icon === em ? 'border-[--accent] bg-[--accent]/20 scale-110' : 'border-border'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label block mb-1.5">Color Accent</label>
              <div className="flex items-center gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-5 w-5 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-125 border-[--fg]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Frequency & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="input-base text-sm capitalize"
              >
                <option value="daily">Every Day</option>
                <option value="custom">Selected Days</option>
                <option value="weekly">Weekly Target</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Health, Fitness, Intellect, etc."
                className="input-base text-sm"
              />
            </div>
          </div>

          {frequency === 'custom' && (
            <div>
              <label className="label block mb-1.5">Scheduled Days</label>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((w, idx) => {
                  const active = daysOfWeek.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      className={`h-8 rounded text-xs font-bold border transition-colors ${
                        active
                          ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                          : 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target Type & Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Goal Type</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as HabitTargetType)}
                className="input-base text-sm"
              >
                <option value="boolean">Done / Not Done</option>
                <option value="numeric">Numeric Target</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Reminder Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input-base text-sm"
              />
            </div>
          </div>

          {targetType === 'numeric' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded bg-[--muted]/40 border border-border">
              <div>
                <label className="label block mb-1.5">Daily Target</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseFloat(e.target.value) || 1)}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="label block mb-1.5">Unit</label>
                <input
                  type="text"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
            </div>
          )}

          {/* Status selector */}
          <div>
            <label className="label block mb-1.5">Habit State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HabitStatus)}
              className="input-base text-sm capitalize"
            >
              <option value="active">Active (Tracking Daily)</option>
              <option value="paused">Paused (Temporary Hiatus)</option>
              <option value="archived">Archived (Hidden from Today)</option>
            </select>
          </div>

          {/* 14-day history check-in matrix */}
          <div>
            <span className="label block mb-2">Past 14 Days Check-in Ledger</span>
            <div className="grid grid-cols-7 gap-1 border border-border p-2 rounded bg-[--surface]">
              {recentDays.map((d) => {
                const isScheduled = isHabitScheduled(editingHabit, d);
                const log = habitLogs.find((l) => l.habit_id === editingHabit.id && l.date === d);
                const isDone = log?.completed;
                const isToday = d === today;

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleHabit(editingHabit.id, d)}
                    title={`${d}: ${isDone ? 'Completed' : isScheduled ? 'Scheduled (Not completed)' : 'Not scheduled'}`}
                    className={`flex flex-col items-center justify-center p-1.5 rounded border text-xs transition-colors ${
                      isToday ? 'border-2 border-[--accent]' : 'border-border'
                    } ${
                      isDone
                        ? 'bg-[--accent] text-[--on-accent]'
                        : isScheduled
                        ? 'bg-[--surface] hover:bg-[--muted]'
                        : 'bg-[--muted]/40 opacity-50'
                    }`}
                  >
                    <span className="text-[10px] font-mono leading-none">{d.slice(8)}</span>
                    <span className="mt-1">
                      {isDone ? (
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full inline-block bg-[--border]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-[--secondary]">Click any day to toggle completion record.</p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--danger] hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              Delete Habit
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingHabit(null)}
                className="btn-ghost !w-auto px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !w-auto px-5">
                Save Habit
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-sm w-full rounded-lg border border-border bg-[--surface] p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[--danger]">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold font-sans">Delete Habit</h3>
              </div>
              <p className="text-sm text-[--secondary]">
                Are you sure you want to permanently delete <strong>&quot;{editingHabit.name}&quot;</strong> and its historical check-ins?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost !w-auto px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded px-4 py-2 text-xs font-semibold bg-[--danger] text-white hover:opacity-90"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
