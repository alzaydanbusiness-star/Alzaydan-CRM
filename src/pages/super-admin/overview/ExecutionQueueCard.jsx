import React from 'react';
import { CheckSquare, ChevronRight, Plus, User, Check } from 'lucide-react';

export default function ExecutionQueueCard({
  tasks = [],
  onToggleTask,
  onViewAll,
  onCreateTask
}) {
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#16477A] uppercase tracking-wide">
              Daily Execution & Follow-up Queue
            </h3>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {pendingTasks.length}
            </span>
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#16477A] hover:text-[#1E5BA0] transition-colors cursor-pointer"
          >
            <span>Task List</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content: Empty state matching reference */}
        {tasks.length === 0 ? (
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-0.5">
              <CheckSquare className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-slate-600">No pending operational milestones.</p>
            <button
              onClick={onCreateTask}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16477A] hover:text-[#1E5BA0] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create New Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 mt-1.5">
            {tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => onToggleTask?.(t.id)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  t.completed
                    ? 'bg-slate-50/50 border-slate-200/60 opacity-60'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      t.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#16477A] bg-white'
                    }`}
                  >
                    {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs font-medium truncate ${
                      t.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {t.assignedTo && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      <User className="w-2.5 h-2.5 text-slate-500" />
                      <span>{t.assignedTo}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400">
            {tasks.filter((t) => t.completed).length} of {tasks.length} completed
          </span>
          <button
            onClick={onCreateTask}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16477A] hover:underline cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Create New Task</span>
          </button>
        </div>
      )}
    </div>
  );
}
