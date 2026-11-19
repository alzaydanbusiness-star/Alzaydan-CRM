import React, { useState } from 'react';
import {
  Trophy,
  Phone,
  Mail
} from 'lucide-react';

export default function TopPerformers({ teams }) {
  const [metric, setMetric] = useState('attainment'); // 'attainment' or 'revenue'

  // Extract all executives across the 3 teams and attach team info
  const allExecutives = teams.flatMap(team => 
    team.executives.map(rep => ({
      ...rep,
      teamName: team.name,
      teamLead: team.lead,
      attainment: ((rep.sales / rep.target) * 100).toFixed(1)
    }))
  );

  // Sort based on selected metric
  const sortedReps = [...allExecutives].sort((a, b) => {
    if (metric === 'attainment') {
      return parseFloat(b.attainment) - parseFloat(a.attainment);
    }
    return b.sales - a.sales;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Top Sales Executives Leaderboard
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
              Cross-Team Rankings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Performance comparison of all 9 Sales Executives across Team 1, Team 2, and Team 3
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMetric('attainment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              metric === 'attainment'
                ? 'bg-white text-[#063056] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quota Attainment %
          </button>
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              metric === 'revenue'
                ? 'bg-white text-[#063056] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Revenue ($)
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-5 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100">
        {sortedReps.slice(0, 3).map((rep, idx) => {
          const rankColors = [
            { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', badge: 'bg-amber-500 text-white', label: '1st Place' },
            { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800', badge: 'bg-slate-400 text-white', label: '2nd Place' },
            { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', badge: 'bg-amber-700 text-white', label: '3rd Place' },
          ][idx];

          return (
            <div
              key={rep.id}
              className={`p-4 rounded-xl border ${rankColors.bg} relative flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${rankColors.badge}`}>
                    {rankColors.label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {rep.teamName}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-[#063056] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {rep.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">{rep.name}</div>
                    <div className="text-[11px] text-slate-500">{rep.role}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">${rep.sales.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Target: ${rep.target.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#063056]">{rep.attainment}%</div>
                  <div className="text-[10px] text-emerald-600 font-bold">{rep.dealsWon} Deals Won</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Rankings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Sales Executive</th>
              <th className="py-3 px-4">Assigned Team</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Closed Sales</th>
              <th className="py-3 px-4">Quota Attainment</th>
              <th className="py-3 px-4">Deals Won</th>
              <th className="py-3 px-4">Win Rate</th>
              <th className="py-3 px-4 text-right">Quick Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedReps.map((rep, idx) => {
              const pct = parseFloat(rep.attainment);
              return (
                <tr key={rep.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-500">
                    {idx === 0 && <span className="text-amber-500 font-black">🥇 1</span>}
                    {idx === 1 && <span className="text-slate-400 font-black">🥈 2</span>}
                    {idx === 2 && <span className="text-amber-700 font-black">🥉 3</span>}
                    {idx > 2 && <span>#{idx + 1}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{rep.name}</div>
                    <div className="text-[11px] text-slate-400">{rep.role}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#063056] text-[11px] font-semibold border border-blue-100">
                      {rep.teamName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    ${rep.target.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    ${rep.sales.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 100 ? 'bg-emerald-500' : 'bg-[#063056]'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`font-extrabold text-xs ${
                        pct >= 100 ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {rep.attainment}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {rep.dealsWon} deals
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-700">
                    {rep.winRate}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`mailto:${rep.email}`}
                        title={rep.email}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#063056] hover:bg-slate-100 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${rep.phone}`}
                        title={rep.phone}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#063056] hover:bg-slate-100 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
