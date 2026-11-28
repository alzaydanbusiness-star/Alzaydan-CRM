import React from 'react';
import {
  Calendar,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function PendingTasks({ tasks = [], onToggleTask, onViewAll }) {
  const displayTasks = tasks;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#011635]" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Pending Tasks
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#011635] hover:underline cursor-pointer"
        >
          View All &rarr;
        </button>
      </div>

      {/* Task Checklist / Empty State */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {displayTasks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-1.5">
            <Calendar className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-xs text-slate-600">No pending tasks found</p>
            <p className="text-[11px] text-slate-400">Scheduled followups and calls will appear here.</p>
          </div>
        ) : (
          displayTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {/* Checkbox + Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    onToggleTask?.(task.id);
                    toast.success(
                      task.completed
                        ? `Task reopened: "${task.title}"`
                        : `Task completed: "${task.title}"`
                    );
                  }}
                  className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-[#011635] border-[#011635] text-white'
                      : 'border-slate-300 hover:border-[#011635] bg-white'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <span
                  className={`text-xs font-semibold truncate ${
                    task.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {/* Priority Tag & Due Date */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${task.priorityColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                >
                  {task.priority || 'Medium'}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium min-w-[70px] justify-end">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{task.dueDate || 'Today'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
