import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Filter,
  Briefcase,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function SummaryCards({ team, onOpenRoster }) {
  const attainment = ((team.closedSales / team.target) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Team Quota Delivery (MTD) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Team 1 Quota (MTD)</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#063056] border border-blue-100 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${team.closedSales.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-medium">
            <span>Target: ${team.target.toLocaleString()}</span>
            <span className="text-emerald-600 font-extrabold">{attainment}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#063056] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(attainment, 100)}%` }}
          />
        </div>
      </div>

      {/* Card 2: Active Team Pipeline */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Team Pipeline Value</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${team.pipelineValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              {team.monthlyPace}
            </span>
            <span>across 22 deals</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          Weighted close: ${(team.pipelineValue * 0.48).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Card 3: Average Deal Size */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Average Deal Size</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            $56,800
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.4%
            </span>
            <span>across 22 team deals</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          Top deal: $185,000 (Baraka Oil & Gas)
        </div>
      </div>

      {/* Card 4: Deals Won MTD & Team Roster shortcut */}
      <div 
        onClick={onOpenRoster}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 cursor-pointer hover:border-blue-400 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Deals Won (MTD)</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
            <span>{team.dealsWon} Closed Deals</span>
            <span className="text-xs font-extrabold text-[#063056]">{team.winRate}% Win</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>3 assigned Sales Executives</span>
          </div>
        </div>
        <div className="text-[11px] text-blue-600 font-bold flex items-center justify-between pt-1">
          <span>Click to view rep breakdown</span>
          <span className="group-hover:translate-x-1 transition">→</span>
        </div>
      </div>

    </div>
  );
}

