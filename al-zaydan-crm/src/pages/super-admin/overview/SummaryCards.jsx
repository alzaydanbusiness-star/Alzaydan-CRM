import React from 'react';
import {
  Users,
  Filter,
  User,
  Layers,
  ArrowUp
} from 'lucide-react';

export default function SummaryCards({
  onSelectMetric,
  employeesCount = 0,
  leadsCount = 0,
  customersCount = 0,
  salesAmount = 0
}) {
  const cards = [
    {
      id: 'employees',
      label: 'Total Employees',
      value: String(employeesCount),
      change: '0%',
      icon: Users,
      tab: 'Employees'
    },
    {
      id: 'leads',
      label: 'Total Leads',
      value: String(leadsCount),
      change: '0%',
      icon: Filter,
      tab: 'Leads'
    },
    {
      id: 'customers',
      label: 'Total Customers',
      value: String(customersCount),
      change: '0%',
      icon: User,
      tab: 'Customers'
    },
    {
      id: 'sales',
      label: 'Total Sales (YTD)',
      value: `AED ${salesAmount.toLocaleString()}`,
      change: '0%',
      icon: Layers,
      tab: 'Sales'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onSelectMetric?.(card.tab)}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-4"
          >
            {/* Soft Blue Icon Container (Matching exact reference) */}
            <div className="w-12 h-12 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 stroke-[1.8]" />
            </div>

            {/* Label, Number & Positive Growth Badge */}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 mb-0.5 truncate">
                {card.label}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <span className="bg-emerald-50 text-emerald-600 font-bold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0">
                  <ArrowUp className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>{card.change}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
