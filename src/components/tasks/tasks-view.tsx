'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storage/store-context';
import type { Task, TaskList, PriorityLevel, RecurringSchedule } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  FolderPlus,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  Repeat,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

type TaskViewTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
type SortField = 'due_date' | 'priority' | 'title' | 'created_at';
type GroupField = 'none' | 'project' | 'priority' | 'status';

export function TasksView() {
  const {
    tasks,
    taskLists,
    today,
    toggleTask,
    deleteTask,
    reorderTasks,
    createTaskList,
    deleteTaskList,
    setQuickAddOpen,
    setEditingTask,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TaskViewTab>('all');
  const [selectedListId, setSelectedListId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('due_date');
  const [sortAsc, setSortAsc] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupField>('none');

  // New list modal state
  const [isNewListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#1f5c3f');

  // Priority ranking for sorting
  const priorityRank: Record<PriorityLevel, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Tab filter
      if (activeTab === 'today') {
        if (t.due_date !== today) return false;
      } else if (activeTab === 'upcoming') {
        if (!t.due_date || t.due_date <= today || t.completed) return false;
      } else if (activeTab === 'overdue') {
        if (t.completed || !t.due_date || t.due_date >= today) return false;
      } else if (activeTab === 'completed') {
        if (!t.completed) return false;
      }

      // 2. Project / List filter
      if (selectedListId !== 'all') {
        if (t.list_id !== selectedListId) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesCat = t.category?.toLowerCase().includes(q);
        const matchesTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeTab, selectedListId, searchQuery, today]);

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'priority') {
        cmp = priorityRank[b.priority] - priorityRank[a.priority];
      } else if (sortBy === 'due_date') {
        const da = a.due_date || '9999-99-99';
        const db = b.due_date || '9999-99-99';
        cmp = da.localeCompare(db);
      } else if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortBy === 'created_at') {
        cmp = a.created_at.localeCompare(b.created_at);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [filteredTasks, sortBy, sortAsc]);

  // Grouped tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupName: 'Tasks', items: sortedTasks }];
    }

    const groups = new Map<string, Task[]>();

    if (groupBy === 'project') {
      const listMap = new Map(taskLists.map((l) => [l.id, l.name]));
      sortedTasks.forEach((t) => {
        const name = (t.list_id && listMap.get(t.list_id)) || 'Inbox';
        const arr = groups.get(name) || [];
        arr.push(t);
        groups.set(name, arr);
      });
    } else if (groupBy === 'priority') {
      (['urgent', 'high', 'medium', 'low'] as const).forEach((p) => {
        const arr = sortedTasks.filter((t) => t.priority === p);
        if (arr.length > 0) groups.set(p.toUpperCase(), arr);
      });
    } else if (groupBy === 'status') {
      const pending = sortedTasks.filter((t) => !t.completed);
      const done = sortedTasks.filter((t) => t.completed);
      if (pending.length > 0) groups.set('Pending Execution', pending);
      if (done.length > 0) groups.set('Completed', done);
    }

    return Array.from(groups.entries()).map(([groupName, items]) => ({ groupName, items }));
  }, [sortedTasks, groupBy, taskLists]);

  // Handle reorder
  const handleMove = (task: Task, direction: 'up' | 'down') => {
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= tasks.length) return;

    const copy = [...tasks];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    reorderTasks(copy);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createTaskList({ name: newListName.trim(), color: newListColor });
    setNewListName('');
    setNewListOpen(false);
  };

  const priorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return 'text-[--danger] bg-[--danger]/10 border-[--danger]/40 font-bold';
      case 'high':
        return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold';
      case 'medium':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'low':
        return 'text-[--secondary] bg-[--muted] border-border';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="label">Ledger / Task Registry</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif tracking-tight text-[--fg]">
            Task Management
          </h1>
          <p className="mt-1 text-xs text-[--secondary]">
            Track, schedule, prioritize, and record completion across all active projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-primary !w-auto !h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {/* Filter and Search toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[--secondary]" />
          <input
            type="text"
            placeholder="Search by title, tag, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[--secondary] hover:text-[--fg]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort and Group Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort By */}
          <div className="flex items-center gap-1 rounded border border-border bg-[--surface] px-2.5 py-1 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-[--secondary]" />
            <span className="text-[--secondary]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-transparent font-medium text-[--fg] focus:outline-none cursor-pointer"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created_at">Date Created</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="ml-1 p-0.5 text-[--secondary] hover:text-[--fg]"
              title={sortAsc ? 'Ascending' : 'Descending'}
            >
              {sortAsc ? '↑' : '↓'}
            </button>
          </div>

          {/* Group By */}
          <div className="flex items-center gap-1 rounded border border-border bg-[--surface] px-2.5 py-1 text-xs">
            <Layers className="h-3.5 w-3.5 text-[--secondary]" />
            <span className="text-[--secondary]">Group:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupField)}
              className="bg-transparent font-medium text-[--fg] focus:outline-none cursor-pointer"
            >
              <option value="none">None</option>
              <option value="project">Project</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs strip */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
        {[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          { id: 'today', label: 'Today', count: tasks.filter((t) => t.due_date === today).length },
          {
            id: 'upcoming',
            label: 'Upcoming',
            count: tasks.filter((t) => t.due_date && t.due_date > today && !t.completed).length,
          },
          {
            id: 'overdue',
            label: 'Overdue',
            count: tasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length,
          },
          {
            id: 'completed',
            label: 'Completed',
            count: tasks.filter((t) => t.completed).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TaskViewTab)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[--accent] text-[--fg]'
                : 'border-transparent text-[--secondary] hover:text-[--fg]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-[--accent] text-[--on-accent]'
                  : 'bg-[--muted] text-[--secondary]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Project Lists filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="label text-[10px] shrink-0">Projects:</span>
        <button
          onClick={() => setSelectedListId('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
            selectedListId === 'all'
              ? 'bg-[--fg] text-[--bg] border-[--fg]'
              : 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
          }`}
        >
          All Projects
        </button>

        {taskLists.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedListId(l.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
              selectedListId === l.id
                ? 'bg-[--accent] text-[--on-accent] border-[--accent]'
                : 'bg-[--surface] text-[--secondary] border-border hover:bg-[--muted]'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span>{l.name}</span>
          </button>
        ))}

        <button
          onClick={() => setNewListOpen(true)}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-[--secondary] border border-dashed border-border hover:border-[--accent] hover:text-[--accent]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Task List Groups */}
      {sortedTasks.length === 0 ? (
        <div className="py-20 text-center rounded-lg border border-dashed border-border bg-[--surface]/40 p-8 space-y-3">
          <p className="font-serif text-2xl text-[--secondary]">-</p>
          <p className="font-serif text-lg text-[--fg]">No tasks match your criteria</p>
          <p className="text-xs text-[--secondary] max-w-sm mx-auto">
            Try adjusting your search query, selecting a different project filter, or creating a new task.
          </p>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-primary !w-auto px-5 !h-9 text-xs font-semibold mx-auto mt-2"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTasks.map(({ groupName, items }) => (
            <div key={groupName} className="space-y-2">
              {groupBy !== 'none' && (
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <span className="label font-bold text-xs">{groupName}</span>
                  <span className="font-mono text-xs text-[--secondary]">{items.length} tasks</span>
                </div>
              )}

              <div className="divide-y divide-border rounded-lg border border-border bg-[--surface] overflow-hidden">
                {items.map((t) => {
                  const isOverdue = !t.completed && t.due_date && t.due_date < today;
                  const isDueToday = t.due_date === today;
                  const project = taskLists.find((l) => l.id === t.list_id);

                  return (
                    <div
                      key={t.id}
                      className={`p-4 flex items-start justify-between gap-4 hover:bg-[--muted]/30 transition-colors ${
                        t.completed ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(t.id)}
                          aria-label={`Toggle task ${t.title}`}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            t.completed
                              ? 'border-[--accent] bg-[--accent] text-[--on-accent]'
                              : 'border-[--border] hover:border-[--accent] bg-[--surface]'
                          }`}
                        >
                          {t.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        {/* Title and details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium text-sm text-[--fg] ${
                                t.completed ? 'line-through text-[--secondary]' : ''
                              }`}
                            >
                              {t.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] uppercase border ${priorityBadge(
                                t.priority
                              )}`}
                            >
                              {t.priority}
                            </span>
                            {project && (
                              <span className="inline-flex items-center gap-1 rounded bg-[--muted] px-2 py-0.2 text-[10px] font-mono text-[--secondary]">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                {project.name}
                              </span>
                            )}
                          </div>

                          {t.description && (
                            <p className="text-xs text-[--secondary] mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          )}

                          {/* Metadata row */}
                          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-[--secondary] flex-wrap">
                            {t.due_date && (
                              <span
                                className={`flex items-center gap-1 ${
                                  isOverdue
                                    ? 'text-[--danger] font-bold'
                                    : isDueToday
                                    ? 'text-[--accent] font-bold'
                                    : ''
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                {isDueToday ? 'Today' : t.due_date}
                                {isOverdue && ' (Overdue)'}
                              </span>
                            )}

                            {t.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {t.start_time}
                              </span>
                            )}

                            {t.recurring !== 'none' && (
                              <span className="flex items-center gap-1 text-[--accent]">
                                <Repeat className="h-3 w-3" />
                                {t.recurring}
                              </span>
                            )}

                            {t.category && <span>{t.category}</span>}

                            {t.tags.length > 0 && (
                              <span className="text-[10px]">
                                #{t.tags.join(' #')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMove(t, 'up')}
                          className="p-1 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(t, 'down')}
                          className="p-1 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-[--secondary] hover:text-[--fg] rounded hover:bg-[--muted]"
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isNewListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateList}
            className="w-full max-w-sm rounded-lg border border-border bg-[--surface] p-5 shadow-2xl space-y-4"
          >
            <div>
              <span className="label block">Create Project List</span>
              <h3 className="font-bold text-base">New Task List</h3>
            </div>
            <div>
              <label className="label block mb-1">List Name</label>
              <input
                type="text"
                placeholder="e.g. Client Deliverables, Taxes"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="label block mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                {['#1f5c3f', '#0d9488', '#d97706', '#ba1a1a', '#4f46e5', '#7c3aed', '#475569'].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewListColor(c)}
                      className={`h-6 w-6 rounded-full border-2 ${
                        newListColor === c ? 'scale-125 border-[--fg]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setNewListOpen(false)}
                className="btn-ghost !w-auto px-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary !w-auto px-4 text-xs font-semibold">
                Create List
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
