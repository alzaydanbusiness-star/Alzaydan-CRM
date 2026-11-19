import React from 'react';
import {
  Zap,
  Plus,
  Users,
  CheckSquare
} from 'lucide-react';

export default function QuickActions({
  onCreateLead,
  onAddCustomer,
  onCreateTask
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-blue-600 fill-blue-600/20" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h3>
      </div>

      {/* 3 Action Buttons Matching Exact Reference */}
      <div className="grid grid-cols-3 gap-3 flex-1 items-center">
        {/* 1. Add Lead (Primary Solid Blue Button) */}
        <button
          type="button"
          onClick={onCreateLead}
          className="h-full min-h-[92px] rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white flex flex-col items-center justify-center gap-2 p-3 font-bold text-xs shadow-sm shadow-blue-600/25 transition cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Lead</span>
        </button>

        {/* 2. Add Customer (White Outlined Button) */}
        <button
          type="button"
          onClick={onAddCustomer}
          className="h-full min-h-[92px] rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 active:scale-[0.98] text-slate-700 flex flex-col items-center justify-center gap-2 p-3 font-bold text-xs transition cursor-pointer"
        >
          <Users className="w-5 h-5 text-blue-600 stroke-[2]" />
          <span>Add Customer</span>
        </button>

        {/* 3. Create Task (White Outlined Button) */}
        <button
          type="button"
          onClick={onCreateTask}
          className="h-full min-h-[92px] rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 active:scale-[0.98] text-slate-700 flex flex-col items-center justify-center gap-2 p-3 font-bold text-xs transition cursor-pointer"
        >
          <CheckSquare className="w-5 h-5 text-blue-600 stroke-[2]" />
          <span>Create Task</span>
        </button>
      </div>
    </div>
  );
}
