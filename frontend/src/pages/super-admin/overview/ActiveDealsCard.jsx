import React from 'react';
import { Briefcase, ChevronRight, Plus } from 'lucide-react';

export default function ActiveDealsCard({
  opportunities = [],
  onViewAll,
  onCreateOpportunity
}) {
  const dealsCount = opportunities.length;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#16477A] uppercase tracking-wide">
              Active Commercial Inquiries & Deals
            </h3>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[#16477A] border border-blue-100">
              {dealsCount} Deals
            </span>
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#16477A] hover:text-[#1E5BA0] transition-colors cursor-pointer"
          >
            <span>All Inquiries</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content: Empty state matching reference */}
        {dealsCount === 0 ? (
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-0.5">
              <Briefcase className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-slate-600">No active commercial deals yet.</p>
            <button
              onClick={onCreateOpportunity}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16477A] hover:text-[#1E5BA0] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create First Opportunity</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-1">
            {opportunities.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition"
              >
                <div className="space-y-0.5 max-w-[60%]">
                  <div className="text-xs font-bold text-[#16477A] truncate">
                    {deal.client || deal.company}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {deal.title}
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-xs font-bold text-[#16477A] font-mono">
                    {deal.amount || deal.value}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border bg-blue-50 text-[#16477A] border-blue-200">
                    {deal.stage || deal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dealsCount > 0 && (
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400">
            {dealsCount} Active Deals
          </span>
          <button
            onClick={onCreateOpportunity}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16477A] hover:underline cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Create Opportunity</span>
          </button>
        </div>
      )}
    </div>
  );
}
