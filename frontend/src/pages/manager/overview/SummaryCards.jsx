import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  UserPlus
} from 'lucide-react';

export default function SummaryCards({ 
  teams, 
  pendingApprovals, 
  activitiesCount = 7,
  onOpenApprovals,
  onOpenAddTeamLead,
  onScrollToActivities
}) {
  // Aggregate statistics across all teams
  const totalTarget = teams.reduce((acc, t) => acc + (t.target || 0), 0);
  const totalClosed = teams.reduce((acc, t) => acc + (t.closedSales || 0), 0);
  const pendingDeals = pendingApprovals.filter(a => a.status === 'Pending');
  const pendingValue = pendingDeals.reduce((a, c) => a + (c.dealValue || 0), 0);
  const attainment = totalTarget > 0 ? ((totalClosed / totalTarget) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* KPI 1: Assigned Team Leads */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Assigned Team Leads</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#063056] border border-blue-100 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            {teams.length} Leads
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              Active Roster
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Oversight of {teams.reduce((acc, t) => acc + (t.executives?.length || 0), 0)} Sales Executives
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAddTeamLead}
          className="text-[11px] text-[#063056] hover:text-[#094173] font-bold flex items-center gap-1 cursor-pointer pt-1 transition group"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition" />
          <span>+ Add Another Team Lead</span>
        </button>
      </div>

      {/* KPI 2: Pending Approvals Queue */}
      <div 
        onClick={onOpenApprovals}
        className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 cursor-pointer hover:border-amber-400 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Pending Approvals</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-amber-600 tracking-tight flex items-baseline gap-2">
            {pendingDeals.length} Action{pendingDeals.length !== 1 ? 's' : ''}
            {pendingDeals.length > 0 && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Review Needed
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Totaling AED {pendingValue.toLocaleString()} in review
          </div>
        </div>
        <div className="text-[11px] text-[#063056] font-bold group-hover:underline flex items-center gap-1 pt-1">
          <span>Sign off requests</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>

      {/* KPI 3: Revenue vs Division Target */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Division Quota (MTD)</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            AED {totalClosed.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-medium">
            <span>Target: AED {totalTarget.toLocaleString()}</span>
            <span className="text-[#063056] font-bold">{attainment}%</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#063056] h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(Number(attainment), 100)}%` }} 
          />
        </div>
      </div>

      {/* KPI 4: Team Lead Live Activities */}
      <div 
        onClick={onScrollToActivities}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 cursor-pointer hover:border-blue-300 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Team Activities Today</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            {activitiesCount} Events
            <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {teams.length} divisions & field reps
          </div>
        </div>
        <div className="text-[11px] text-[#063056] font-bold group-hover:underline flex items-center gap-1 pt-1">
          <span>View activity timeline</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>

    </div>
  );
}
