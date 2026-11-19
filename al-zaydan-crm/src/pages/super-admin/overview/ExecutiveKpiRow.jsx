import React from 'react';
import {
  DollarSign,
  FileText,
  Target,
  Briefcase,
  CheckSquare
} from 'lucide-react';

export default function ExecutiveKpiRow({
  totalValue = 'AED 0',
  activeDeals = 0,
  openOffers = 'AED 0',
  proposalsCount = 0,
  leadsCount = 1,
  hotPriorityCount = 0,
  accountsCount = 0,
  tasksCount = 0,
  urgentCount = 0,
  onSelectMetric
}) {
  const kpis = [
    {
      id: 'sales',
      label: 'TOTAL VALUE',
      value: totalValue,
      badgeText: '↗ Live Pipeline',
      badgeColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      secondaryText: `${activeDeals} Active Deals`,
      icon: DollarSign,
      iconColor: 'text-[#16477A]',
      iconBg: 'bg-blue-50/80 border-blue-100/80',
      actionTab: 'Sales'
    },
    {
      id: 'offers',
      label: 'OPEN COMMERCIAL OFFERS',
      value: openOffers,
      badgeText: 'In Proposal Phase',
      badgeColor: 'text-blue-700 bg-blue-50/80 border-blue-200/80',
      secondaryText: `${proposalsCount} Proposals`,
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50/80 border-purple-100/80',
      actionTab: 'Sales'
    },
    {
      id: 'leads',
      label: 'ACTIVE INQUIRIES',
      value: `${leadsCount} Leads`,
      badgeText: `${hotPriorityCount} Hot Priority`,
      badgeColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80',
      secondaryText: 'Live Inquiries',
      icon: Target,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50/80 border-amber-100/80',
      actionTab: 'Leads'
    },
    {
      id: 'customers',
      label: 'CORPORATE ACCOUNTS',
      value: `${accountsCount} Accounts`,
      badgeText: '100% Verified',
      badgeColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      secondaryText: 'Enterprise Client Accounts',
      icon: Briefcase,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50/80 border-purple-100/80',
      actionTab: 'Customers'
    },
    {
      id: 'tasks',
      label: 'DAILY ACTION QUEUE',
      value: `${tasksCount} Tasks`,
      badgeText: 'All on track',
      badgeColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      secondaryText: `${urgentCount} Urgent`,
      icon: CheckSquare,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50/80 border-rose-100/80',
      actionTab: 'Tasks'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            onClick={() => onSelectMetric?.(kpi.actionTab)}
            className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Top row: Label + Icon in soft rounded box */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`w-6 h-6 rounded-md border ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center shrink-0`}>
                  <IconComponent className="w-3 h-3" />
                </div>
              </div>

              {/* Value in refined Dark Blue font */}
              <div className="text-xl font-bold text-[#16477A] tracking-tight">
                {kpi.value}
              </div>
            </div>

            {/* Bottom Row: Status badge / text */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${kpi.badgeColor}`}>
                {kpi.badgeText}
              </span>
              <span className="text-slate-400 font-medium text-[10px]">
                {kpi.secondaryText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
