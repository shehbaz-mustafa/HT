'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { PriorityLevel, HabitFrequency, HabitTargetType } from '@/lib/types';
import { Check, X, Calendar, Clock, Tag, Flame, Plus, AlertCircle } from 'lucide-react';

const ICONS = ['💧', '📖', '🏃', '🧘', '🏋️', '⚡', '🌙', '✍️', '🍎', '🎯', '🌿', '💻'];
const COLORS = [
  '#1f5c3f', // Forest green
  '#0d9488', // Teal
  '#d97706', // Amber
  '#ba1a1a', // Crimson
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#475569', // Slate
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function QuickAddModal() {
  const {
    isQuickAddOpen,
    setQuickAddOpen,
    today,
    createTask,
    createHabit,
    taskLists,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'task' | 'habit'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(today);
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskListId, setTaskListId] = useState(taskLists[0]?.id || 'list-inbox');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskTime, setTaskTime] = useState('');
  const [taskTagInput, setTaskTagInput] = useState('');
  const [taskTags, setTaskTags] = useState<string[]>([]);

  // Habit form state
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [habitIcon, setHabitIcon] = useState('💧');
  const [habitColor, setHabitColor] = useState(COLORS[0]);
  const [habitFreq, setHabitFreq] = useState<HabitFrequency>('daily');
  const [habitDays, setHabitDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [habitTargetType, setHabitTargetType] = useState<HabitTargetType>('boolean');
  const [habitTargetVal, setHabitTargetVal] = useState<number>(1);
  const [habitTargetUnit, setHabitTargetUnit] = useState('times');
  const [habitReminder, setHabitReminder] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isQuickAddOpen]);

  if (!isQuickAddOpen) return null;

  const handleAddTag = () => {
    const trimmed = taskTagInput.trim().replace(/^#/, '');
    if (trimmed && !taskTags.includes(trimmed)) {
      setTaskTags([...taskTags, trimmed]);
      setTaskTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTaskTags(taskTags.filter((t) => t !== tag));
  };

  const handleToggleDay = (idx: number) => {
    if (habitDays.includes(idx)) {
      if (habitDays.length > 1) {
        setHabitDays(habitDays.filter((d) => d !== idx));
      }
    } else {
      setHabitDays([...habitDays, idx].sort());
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      due_date: taskDueDate || today,
      start_time: taskTime || null,
      priority: taskPriority,
      list_id: taskListId,
      category: taskCategory,
      tags: taskTags,
    });

    // Reset and close
    setTaskTitle('');
    setTaskDesc('');
    setTaskTags([]);
    setQuickAddOpen(false);
  };

  const handleSubmitHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    createHabit({
      name: habitName.trim(),
      description: habitDesc.trim(),
      category: habitCategory,
      icon: habitIcon,
      color: habitColor,
      frequency_type: habitFreq,
      days_of_week: habitFreq === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : habitDays,
      target_type: habitTargetType,
      target_value: habitTargetType === 'numeric' ? Number(habitTargetVal) || 1 : 1,
      target_unit: habitTargetType === 'numeric' ? habitTargetUnit.trim() || 'times' : 'times',
      reminder_time: habitReminder || null,
    });

    setHabitName('');
    setHabitDesc('');
    setQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-[--surface] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with segmented switch */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-[--muted]/40">
          <div className="flex items-center gap-1 bg-[--muted] p-1 rounded-md border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'task'
                  ? 'bg-[--surface] text-[--fg] shadow-sm'
                  : 'text-[--secondary] hover:text-[--fg]'
              }`}
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('habit')}
              className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'habit'
                  ? 'bg-[--surface] text-[--fg] shadow-sm'
                  : 'text-[--secondary] hover:text-[--fg]'
              }`}
            >
              Add Habit
            </button>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="rounded p-1 text-[--secondary] hover:bg-[--muted] hover:text-[--fg]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {activeTab === 'task' ? (
          <form onSubmit={handleSubmitTask} className="p-5 space-y-4">
            <div>
              <label className="label block mb-1.5">Task Title *</label>
              <input
                ref={inputRef}
                type="text"
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="input-base text-base font-medium"
              />
            </div>

            <div>
              <label className="label block mb-1.5">Description (Optional)</label>
              <textarea
                placeholder="Add context, notes, or subtasks..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={2}
                className="input-base text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="label block mb-1.5">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                  className="input-base text-sm capitalize"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Project / List</label>
                <select
                  value={taskListId}
                  onChange={(e) => setTaskListId(e.target.value)}
                  className="input-base text-sm"
                >
                  {taskLists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Scheduled Time</label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label block mb-1.5">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. deepwork, urgent"
                  value={taskTagInput}
                  onChange={(e) => setTaskTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="input-base text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-ghost !w-auto px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {taskTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {taskTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded bg-[--muted] px-2 py-0.5 font-mono text-xs text-[--secondary]"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-[--danger]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="btn-ghost !w-auto px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!taskTitle.trim()}
                className="btn-primary !w-auto px-5"
              >
                Record Task
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitHabit} className="p-5 space-y-4">
            <div>
              <label className="label block mb-1.5">Habit Name *</label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Read 20 pages, Hydrate 2L, Run"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
                className="input-base text-base font-medium"
              />
            </div>

            {/* Icon & Color selector */}
            <div className="space-y-3">
              <div>
                <label className="label block mb-1.5">Icon / Emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setHabitIcon(emoji)}
                      className={`h-8 w-8 rounded text-base flex items-center justify-center border transition-all ${
                        habitIcon === emoji
                          ? 'border-[--accent] bg-[--accent]/15 scale-110'
                          : 'border-border hover:bg-[--muted]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label block mb-1.5">Theme Color</label>
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHabitColor(c)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        habitColor === c ? 'scale-125 border-[--fg]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Frequency and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Frequency</label>
                <select
                  value={habitFreq}
                  onChange={(e) => setHabitFreq(e.target.value as HabitFrequency)}
                  className="input-base text-sm capitalize"
                >
                  <option value="daily">Every Day</option>
                  <option value="custom">Selected Days</option>
                  <option value="weekly">Weekly Target</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Category</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="input-base text-sm"
                >
                  <option value="Health">Health</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Intellect">Intellect / Study</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Mind">Mindfulness</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            {/* Custom weekdays selector */}
            {habitFreq === 'custom' && (
              <div>
                <label className="label block mb-1.5">Scheduled Days</label>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((w, idx) => {
                    const active = habitDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleDay(idx)}
                        className={`h-8 rounded text-xs font-bold transition-colors border ${
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

            {/* Target Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Goal Type</label>
                <select
                  value={habitTargetType}
                  onChange={(e) => setHabitTargetType(e.target.value as HabitTargetType)}
                  className="input-base text-sm"
                >
                  <option value="boolean">Simple Check-off (Done / Not Done)</option>
                  <option value="numeric">Numeric Target (Count / Amount)</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Reminder Time</label>
                <input
                  type="time"
                  value={habitReminder}
                  onChange={(e) => setHabitReminder(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
            </div>

            {habitTargetType === 'numeric' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[--muted]/40 border border-border">
                <div>
                  <label className="label block mb-1.5">Daily Target Amount</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={habitTargetVal}
                    onChange={(e) => setHabitTargetVal(parseFloat(e.target.value) || 1)}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">Unit (e.g. Litres, Pages)</label>
                  <input
                    type="text"
                    value={habitTargetUnit}
                    onChange={(e) => setHabitTargetUnit(e.target.value)}
                    placeholder="e.g. pages, km, litres"
                    className="input-base text-sm"
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="btn-ghost !w-auto px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!habitName.trim()}
                className="btn-primary !w-auto px-5"
              >
                Register Habit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
