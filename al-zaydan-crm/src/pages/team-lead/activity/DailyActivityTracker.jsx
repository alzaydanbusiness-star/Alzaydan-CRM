import React from 'react';
import {
  Video,
  FileCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DailyActivityTracker({ reps, metrics }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#063056]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Daily Team Activity & Client Demos
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time executive client demos, commercial proposals, and turnaround SLA performance
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Team SLA Compliance: {metrics.slaCompliance}</span>
        </div>
      </div>

      {/* 3 Activity Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Executive Demos */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              Executive Client Demos
            </span>
            <span className="text-xs font-black text-slate-900">
              {metrics.demosCompleted} / {metrics.demosTarget}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (metrics.demosCompleted / metrics.demosTarget) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-medium">87.5% scheduled demos completed</div>
        </div>

        {/* Metric 2: Proposals Sent */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Proposals & Quotations Sent
            </span>
            <span className="text-xs font-black text-emerald-700">
              {metrics.proposalsSent} / {metrics.proposalsTarget}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: '100%' }}
            />
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Exceeded daily proposal quota</div>
        </div>

        {/* Metric 3: Active Follow-ups & SLA */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Active Lead Follow-ups
            </span>
            <span className="text-xs font-black text-slate-900">
              {metrics.activeFollowups || 26} Inquiries
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{ width: '98%' }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Average response time: 24 mins</div>
        </div>
      </div>

      {/* Rep Breakdown List */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3.5">Executive</th>
              <th className="py-2.5 px-3.5">Demos Completed</th>
              <th className="py-2.5 px-3.5">Proposals Dispatched</th>
              <th className="py-2.5 px-3.5">SLA Compliance</th>
              <th className="py-2.5 px-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reps.map((rep) => {
              const isMet = (rep.demosToday || 2) >= (rep.demosTarget || 2);
              return (
                <tr key={rep.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3.5 font-bold text-slate-900">{rep.name}</td>
                  <td className="py-3 px-3.5 font-bold text-slate-800">
                    {rep.demosToday || 2} <span className="text-slate-400 font-normal">/ {rep.demosTarget || 2}</span>
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-800">
                    {rep.proposalsToday || 2} Sent
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-700">{rep.slaRate || '98.5%'}</span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMet
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isMet ? 'Quota Met' : 'In Progress'}
                    </span>
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
