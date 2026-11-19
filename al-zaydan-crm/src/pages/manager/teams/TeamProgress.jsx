import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  X,
  ArrowRightLeft
} from 'lucide-react';

export default function TeamProgress({ teams, onOpenReallocate }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#063056]" />
            Sales Teams Performance (Team 1, 2, 3)
          </h2>
          <p className="text-xs text-slate-500">
            Compare monthly quota delivery and drill down into individual Sales Executives (SEs) per Team Lead
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReallocate}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-[#063056] transition shadow-2xs cursor-pointer hover:border-blue-400"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Reallocate Team Leads</span>
        </button>
      </div>

      {/* 3 Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teams.map((t) => {
          const pct = ((t.closedSales / t.target) * 100).toFixed(1);
          return (
            <div 
              key={t.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Team Tag & Status */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#063056] text-xs font-bold border border-blue-100">
                    {t.name}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    pct >= 95 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Team Lead Identity */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#063056] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {t.lead.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Team Lead</div>
                    <div className="text-sm font-bold text-slate-900">{t.lead}</div>
                    <div className="text-[11px] text-slate-500">{t.leadEmail}</div>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-900">
                        ${t.closedSales.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        / ${t.target.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#063056]">{pct}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 95 ? 'bg-emerald-600' : 'bg-[#063056]'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* 3 Mini Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400">SE Reps</div>
                    <div className="text-xs font-bold text-slate-800">{t.executives.length} SEs</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400">Win Rate</div>
                    <div className="text-xs font-bold text-[#063056]">{t.winRate}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400">Active Deals</div>
                    <div className="text-xs font-bold text-slate-800">{t.dealsCount}</div>
                  </div>
                </div>
              </div>

              {/* Drill-down CTA */}
              <button
                type="button"
                onClick={() => setSelectedTeam(t)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#063056] flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
              >
                <span>View {t.executives.length} Sales Executives</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal: Individual Sales Executives (SEs) per Team */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Team Drilldown
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedTeam.name} • Sales Executives Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Team Lead: <strong>{selectedTeam.lead}</strong> ({selectedTeam.leadEmail})
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedTeam(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SE Cards Table */}
            <div className="divide-y divide-slate-100">
              {selectedTeam.executives.map((se) => {
                const sePct = ((se.sales / se.target) * 100).toFixed(1);
                return (
                  <div key={se.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#063056] font-bold flex items-center justify-center text-xs border border-blue-100">
                        {se.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{se.name}</div>
                        <div className="text-[11px] text-slate-500">{se.role} • {se.email}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{se.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 sm:text-right">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          ${se.sales.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Quota: ${se.target.toLocaleString()} ({sePct}%)
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="text-xs font-bold text-emerald-600">{se.dealsWon} Won</div>
                        <div className="text-[10px] text-slate-400">{se.activeLeads} active leads</div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sePct >= 100 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {sePct >= 100 ? 'Target Achieved' : `${sePct}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Close Roster
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
