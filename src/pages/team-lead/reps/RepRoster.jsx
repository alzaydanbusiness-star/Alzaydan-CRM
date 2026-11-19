import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Eye,
  LayoutGrid,
  List,
  RotateCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function RepRoster({ reps = [], onSelectRep }) {
  const [viewLayout, setViewLayout] = useState('table'); // 'table' (Clean Directory Table) | 'cards' (Minimal Cards)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filtered reps
  const filteredReps = useMemo(() => {
    return reps.filter((rep) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (rep.name && rep.name.toLowerCase().includes(q)) ||
        (rep.email && rep.email.toLowerCase().includes(q)) ||
        (rep.role && rep.role.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'All' ||
        (rep.status && rep.status.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase().replace(/\s+/g, ''));

      return matchSearch && matchStatus;
    });
  }, [reps, searchQuery, statusFilter]);

  // Aggregate stats
  const totalTarget = useMemo(() => reps.reduce((sum, r) => sum + (r.target || 0), 0), [reps]);
  const totalSales = useMemo(() => reps.reduce((sum, r) => sum + (r.sales || 0), 0), [reps]);
  const overallAttainment = totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Sales Executives Directory
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                {reps.length} Executives
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Team 1 (Alpha) &bull; Assigned Sales Executives, quota delivery and pipeline performance
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher (Table vs Cards) + Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Sales rep roster refreshed')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Bar: Search & Status Filters */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-64 sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search executive by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8.5 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Exceeded Quota">Exceeded Quota</option>
            <option value="On Target">On Target</option>
            <option value="Needs Coaching">Needs Coaching</option>
          </select>
        </div>

        {/* Quota Highlights Pill */}
        <div className="hidden lg:flex items-center gap-2 text-slate-500 font-medium">
          <span>Target: <strong className="text-slate-800 font-bold">AED {totalTarget.toLocaleString()}</strong></span>
          <span className="text-slate-300">&bull;</span>
          <span>Achieved: <strong className="text-emerald-600 font-bold">AED {totalSales.toLocaleString()}</strong></span>
          <span className="text-slate-300">&bull;</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {overallAttainment}% Attainment
          </span>
        </div>
      </div>

      {/* 3. TABLE VIEW (Simple, Clean, Professional) */}
      {viewLayout === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">Sales Executive</th>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4 text-right">Target (AED)</th>
                <th className="py-3 px-4 text-right">Closed Sales (AED)</th>
                <th className="py-3 px-4 text-center">Attainment</th>
                <th className="py-3 px-4 text-center">Deals Won</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No sales executives found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReps.map((rep, idx) => {
                  const attainment = rep.target > 0 ? ((rep.sales / rep.target) * 100).toFixed(1) : '0.0';
                  const isExceeded = parseFloat(attainment) >= 100;
                  const isGood = parseFloat(attainment) >= 90;

                  return (
                    <tr
                      key={rep.id}
                      className="hover:bg-slate-50/80 transition-colors text-slate-700"
                    >
                      {/* SL.No */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Sales Executive Identity */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectRep?.(rep)}
                          className="flex items-center gap-2.5 text-left group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                            {rep.avatar || rep.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline tracking-tight">
                              {rep.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {rep.role}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-normal text-slate-600">
                        <a
                          href={`mailto:${rep.email}`}
                          className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep.email}</span>
                        </a>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <a
                          href={`tel:${rep.phone}`}
                          className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep.phone}</span>
                        </a>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600 font-mono">
                        AED {rep.target.toLocaleString()}
                      </td>

                      {/* Closed Sales */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono">
                        AED {rep.sales.toLocaleString()}
                      </td>

                      {/* Attainment Badge & Mini Bar */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                              isExceeded
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isGood
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {attainment}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isExceeded ? 'bg-emerald-500' : isGood ? 'bg-blue-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(parseFloat(attainment), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Deals Won */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-800">{rep.dealsWon} Won</div>
                        <div className="text-[10px] text-slate-400 font-medium">{rep.winRate}% win rate</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.status === 'Exceeded Quota'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rep.status === 'On Target'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectRep?.(rep)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#011635] text-slate-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. CARDS VIEW (Clean, Minimalist Cards without clutter) */}
      {viewLayout === 'cards' && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredReps.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
              No sales executives found matching your criteria.
            </div>
          ) : (
            filteredReps.map((rep) => {
              const attainment = rep.target > 0 ? ((rep.sales / rep.target) * 100).toFixed(1) : '0.0';
              const isExceeded = parseFloat(attainment) >= 100;
              const isGood = parseFloat(attainment) >= 90;

              return (
                <div
                  key={rep.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Avatar, Name, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                          {rep.avatar || rep.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight">{rep.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{rep.role}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          rep.status === 'Exceeded Quota'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rep.status === 'On Target'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <a href={`mailto:${rep.email}`} className="flex items-center gap-2 hover:text-blue-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{rep.email}</span>
                      </a>
                      <a href={`tel:${rep.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{rep.phone}</span>
                      </a>
                    </div>

                    {/* Quota Progress */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500 font-medium">Quota Attainment</span>
                        <span className={`font-extrabold ${isExceeded ? 'text-emerald-600' : isGood ? 'text-blue-600' : 'text-amber-600'}`}>
                          {attainment}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExceeded ? 'bg-emerald-500' : isGood ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(attainment), 100)}%` }}
                        />
                      </div>
                      <div className="flex items-baseline justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                        <span>AED {rep.sales.toLocaleString()}</span>
                        <span className="text-slate-400">Target: AED {rep.target.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Deals Won</span>
                        <span className="font-extrabold text-slate-900 text-sm">{rep.dealsWon} Won</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Win Rate</span>
                        <span className="font-extrabold text-blue-600 text-sm">{rep.winRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <button
                    type="button"
                    onClick={() => onSelectRep?.(rep)}
                    className="w-full mt-3 py-2 bg-[#011635] hover:bg-[#07254f] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Deals & Pipeline</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Footer Summary */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Showing {filteredReps.length} of {reps.length} Sales Executives</span>
        <span>Division: GCC Commercial Enterprise</span>
      </div>
    </div>
  );
}
