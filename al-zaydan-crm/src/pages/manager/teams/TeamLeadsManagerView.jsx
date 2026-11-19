import React from 'react';
import {
  Users,
  UserPlus,
  Activity,
  Phone,
  Mail,
  ChevronRight,
  Building
} from 'lucide-react';

export default function TeamLeadsManagerView({
  teams,
  onOpenAddModal,
  onFilterTeamLeadActivities,
  selectedLeadFilter
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#063056] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Assigned Team Leads & Divisions
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              {teams.length} Team Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct reporting Team Leads accountable to you. Add new leads, inspect quotas, or drill into live activity.
          </p>
        </div>

        {/* Action Button: Add Team Lead */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#063056] text-white hover:bg-[#094173] text-xs font-bold transition shadow-md shadow-blue-900/20 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>+ Add Team Lead</span>
        </button>
      </div>

      {/* Team Leads Cards Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => {
          const attainment = team.target > 0 ? ((team.closedSales / team.target) * 100).toFixed(1) : '0.0';
          const isSelected = selectedLeadFilter === team.lead;
          const execCount = team.executives ? team.executives.length : 0;

          // Palette accent per team
          const accentColors = [
            { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
            { bg: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-600' },
            { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: 'bg-indigo-600' },
            { bg: 'bg-violet-50 text-violet-700 border-violet-200', bar: 'bg-violet-600' }
          ];
          const accent = accentColors[idx % accentColors.length];

          return (
            <div
              key={team.id}
              className={`p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#063056] bg-blue-50/20 ring-2 ring-[#063056]/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
              }`}
            >
              {/* Top Row: Lead Info & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#063056] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {team.lead.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {team.lead}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                        Team Lead • {team.name}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${accent.bg}`}>
                    {team.status || 'Active'}
                  </span>
                </div>

                {/* Department */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{team.department || 'Commercial Sales'}</span>
                </div>

                {/* Quota Progress Bar */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Monthly Quota</span>
                    <span className="font-black text-slate-900">
                      AED {team.closedSales.toLocaleString()} <span className="text-slate-400 font-normal">/ {team.target.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                      style={{ width: `${Math.min(Number(attainment), 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Attainment Pace</span>
                    <span className="font-bold text-[#063056]">{attainment}%</span>
                  </div>
                </div>

                {/* Metric Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Team Size</span>
                    <span className="font-bold text-slate-800">{execCount} Reps</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Active Pipeline</span>
                    <span className="font-bold text-slate-800">AED {(team.pipelineValue / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Win Rate</span>
                    <span className="font-bold text-slate-800">{team.winRate}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {/* Contact links */}
                <div className="flex items-center gap-1.5 text-slate-400">
                  {team.leadEmail && (
                    <a
                      href={`mailto:${team.leadEmail}`}
                      title={team.leadEmail}
                      className="p-1.5 rounded-lg hover:text-[#063056] hover:bg-slate-100 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {team.leadPhone && (
                    <a
                      href={`tel:${team.leadPhone}`}
                      title={team.leadPhone}
                      className="p-1.5 rounded-lg hover:text-[#063056] hover:bg-slate-100 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Filter Activity Button */}
                <button
                  type="button"
                  onClick={() => onFilterTeamLeadActivities(isSelected ? 'All' : team.lead)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#063056] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>{isSelected ? 'Showing Activity' : 'View Activities'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
