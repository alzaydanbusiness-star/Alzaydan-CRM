import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';

export default function RevenueLedgerCard({ onOpenReports }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#16477A]" />
            <h3 className="text-xs font-bold text-[#16477A] uppercase tracking-wide">
              Commercial Revenue Ledger & Quota Attainment
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Performance ledger comparing contractual quota with realized revenue
          </p>
        </div>

        <button
          onClick={onOpenReports}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#16477A] hover:text-[#1E5BA0] transition-colors cursor-pointer"
        >
          <span>Financial Reports</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ledger Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0.5">
        <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            ANNUAL REVENUE TARGET
          </div>
          <div className="text-base font-bold text-[#16477A] font-mono">
            AED 18,500,000
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Fiscal Year 2026 Target
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            YTD REALIZED REVENUE
          </div>
          <div className="text-base font-bold text-emerald-700 font-mono">
            AED 15,740,000
          </div>
          <div className="text-[10px] font-semibold text-emerald-600">
            85.1% Quota Attained
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            INVOICED COLLECTIONS
          </div>
          <div className="text-base font-bold text-[#16477A] font-mono">
            AED 12,650,000
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            80.4% Collection Realization
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            PENDING COMMERCIAL RECEIVABLES
          </div>
          <div className="text-base font-bold text-amber-600 font-mono">
            AED 3,090,000
          </div>
          <div className="text-[10px] text-amber-600 font-medium">
            Across 22 Active Accounts
          </div>
        </div>
      </div>
    </div>
  );
}
