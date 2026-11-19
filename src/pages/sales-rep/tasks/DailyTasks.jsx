import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function DailyTasks({ tasks, onToggleTask, onAddTask, onDeleteTask }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('Today, 04:00 PM');
  const [newPriority, setNewPriority] = useState('high');

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const created = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      deadline: newDeadline,
      priority: newPriority,
      completed: false,
      dealId: null
    };

    onAddTask(created);
    toast.success('New sales task added');
    setNewTitle('');
    setShowAddForm(false);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-[#063056]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Action Items & Deal Follow-Ups
            </h3>
            <p className="text-xs text-slate-500">
              Personal daily execution checklist to accelerate deal velocity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-xl">
            {completedCount} of {tasks.length} Completed
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#063056] text-white text-xs font-bold rounded-xl hover:bg-[#083E6E] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2.5"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Call legal counsel regarding Al Futtaim indemnity clause..."
            required
            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#063056] outline-none"
          />
          <input
            type="text"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            placeholder="Deadline"
            className="w-36 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#063056] outline-none"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#063056] outline-none"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#063056] text-white text-xs font-bold rounded-xl hover:bg-[#083E6E]"
          >
            Save
          </button>
        </form>
      )}

      {/* Tasks List */}
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 flex items-center justify-between gap-3 transition-colors ${
              task.completed ? 'bg-slate-50/40 opacity-70' : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => {
                  onToggleTask(task.id);
                  toast.success(
                    task.completed
                      ? `Reopened: ${task.title}`
                      : `Completed: ${task.title}`
                  );
                }}
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  task.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-[#063056]'
                }`}
              >
                {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>

              <div className="min-w-0">
                <div
                  className={`text-xs font-semibold ${
                    task.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.deadline}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityStyle(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
              <button
                onClick={() => {
                  onDeleteTask(task.id);
                  toast.info('Task deleted');
                }}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
