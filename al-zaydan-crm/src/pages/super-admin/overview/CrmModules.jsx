import React from 'react';
import {
  LayoutGrid,
  Building2,
  Users,
  Filter,
  User,
  Layers,
  CalendarCheck,
  Target,
  BarChart2
} from 'lucide-react';

export default function CrmModules({ onSelectModule }) {
  const modules = [
    { id: 'org', name: 'Organization', icon: Building2, tab: 'Dashboard' },
    { id: 'emp', name: 'Employees', icon: Users, tab: 'Employees' },
    { id: 'leads', name: 'Leads', icon: Filter, tab: 'Leads' },
    { id: 'cust', name: 'Customers', icon: User, tab: 'Customers' },
    { id: 'sales', name: 'Sales', icon: Layers, tab: 'Sales' },
    { id: 'tasks', name: 'Tasks', icon: CalendarCheck, tab: 'Tasks' },
    { id: 'targets', name: 'Targets', icon: Target, tab: 'Targets' },
    { id: 'reports', name: 'Reports', icon: BarChart2, tab: 'Reports' }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          CRM Modules
        </h3>
      </div>

      {/* 8 Module Horizontal / Responsive Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule?.(mod.tab)}
              className="p-3 rounded-2xl border border-slate-100/90 hover:border-blue-200 hover:shadow-xs bg-white text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors truncate w-full">
                {mod.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
