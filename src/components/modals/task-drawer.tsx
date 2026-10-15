'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { Task, PriorityLevel, RecurringSchedule } from '@/lib/types';
import { X, Trash2, CheckCircle2, RotateCcw, Plus, Tag, Calendar, Clock, AlertTriangle } from 'lucide-react';

export function TaskDrawer() {
  const { editingTask, setEditingTask, updateTask, deleteTask, taskLists } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [listId, setListId] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recurring, setRecurring] = useState<RecurringSchedule>('none');
  const [reminderTime, setReminderTime] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.due_date || '');
      setStartTime(editingTask.start_time || '');
      setDeadline(editingTask.deadline ? editingTask.deadline.slice(0, 16) : '');
      setPriority(editingTask.priority);
      setListId(editingTask.list_id || 'list-inbox');
      setCategory(editingTask.category);
      setTags(editingTask.tags || []);
      setRecurring(editingTask.recurring || 'none');
      setReminderTime(editingTask.reminder_time || '');
      setShowDeleteConfirm(false);
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTask(editingTask.id, {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      start_time: startTime || null,
      deadline: deadline || null,
      priority,
      list_id: listId,
      category: category.trim() || 'General',
      tags,
      recurring,
      reminder_time: reminderTime || null,
    });

    setEditingTask(null);
  };

  const handleToggleComplete = () => {
    const nextCompleted = !editingTask.completed;
    updateTask(editingTask.id, {
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    });
    setEditingTask(null);
  };

  const handleDelete = () => {
    deleteTask(editingTask.id);
    setEditingTask(null);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-full bg-[--surface] border-l border-border shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-[--muted]/40 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                editingTask.completed
                  ? 'border-[--accent] bg-[--accent] text-[--on-accent]'
                  : 'border-border bg-[--surface] text-[--secondary] hover:border-[--accent]'
              }`}
            >
              {editingTask.completed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </>
              ) : (
                'Mark Complete'
              )}
            </button>
            <span className="font-mono text-xs text-[--secondary]">
              ID: {editingTask.id.slice(-6)}
            </span>
          </div>
          <button
            onClick={() => setEditingTask(null)}
            className="rounded p-1 text-[--secondary] hover:bg-[--muted] hover:text-[--fg]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
          <div>
            <label className="label block mb-1.5">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-base text-lg font-medium"
            />
          </div>

          <div>
            <label className="label block mb-1.5">Description & Notes</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant links, notes, or execution details..."
              className="input-base text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="input-base text-sm capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Project / List</label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="input-base text-sm"
              >
                {taskLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="label block mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Recurring Cycle</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringSchedule)}
                className="input-base text-sm capitalize"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Every Weekday (M-F)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
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

          <div>
            <label className="label block mb-1.5">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Health, Personal, Finance"
              className="input-base text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="label block mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag and hit Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
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
            {tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded bg-[--muted] px-2.5 py-1 font-mono text-xs text-[--secondary]"
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

          {/* Metadata ledger */}
          <div className="rounded border border-border p-3.5 bg-[--muted]/30 space-y-1.5 text-xs font-mono text-[--secondary]">
            <div>Created: {editingTask.created_at.replace('T', ' ').slice(0, 19)}</div>
            {editingTask.completed_at && (
              <div>Completed: {editingTask.completed_at.replace('T', ' ').slice(0, 19)}</div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--danger] hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              Delete Task
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="btn-ghost !w-auto px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !w-auto px-5">
                Save Changes
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-sm w-full rounded-lg border border-border bg-[--surface] p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[--danger]">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold font-sans">Delete Task</h3>
              </div>
              <p className="text-sm text-[--secondary]">
                Are you sure you want to permanently delete <strong>&quot;{editingTask.title}&quot;</strong>? This action cannot be undone.
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
