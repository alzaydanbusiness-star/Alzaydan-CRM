import React from 'react';
import {
  X,
  Phone,
  Mail,
  Briefcase,
  Activity
} from 'lucide-react';

export default function RepDetailModal({ rep, onClose }) {
  if (!rep) return null;

  const attainment = ((rep.sales / rep.target) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#063056] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {rep.avatar}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>{rep.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#063056] border border-blue-200">
                  {rep.role}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {rep.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {rep.phone}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Closed Sales</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">AED {rep.sales.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Quota</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">AED {rep.target.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Attainment</div>
              <div className="text-sm font-black text-emerald-600 mt-0.5">{attainment}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
              <div className="text-sm font-black text-blue-600 mt-0.5">{rep.winRate}%</div>
            </div>
          </div>

          {/* Active Deals Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#063056]" />
                Active Pipeline Opportunities ({rep.deals?.length || 0})
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Stage & Probability</span>
            </div>

            <div className="border border-slate-200/90 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Client Company</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Deal Value</th>
                    <th className="py-2.5 px-3">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rep.deals?.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{deal.client}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          deal.stage === 'Won'
                            ? 'bg-emerald-50 text-emerald-700'
                            : deal.stage === 'Negotiation'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900">AED {deal.value.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#063056]"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{deal.probability}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coaching & Daily Summary */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="font-bold text-[#063056] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Current Activity Log:</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              "{rep.recentActivity}"
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
}

