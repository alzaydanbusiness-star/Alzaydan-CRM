import React, { useState } from 'react';
import {
  Inbox,
  UserCheck,
  Building,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function LeadRoutingQueue({ 
  queue, 
  reps, 
  onAssignLead 
}) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [targetRepId, setTargetRepId] = useState(reps[0]?.id || '');

  const handleConfirmAssignment = (lead) => {
    const rep = reps.find(r => r.id === targetRepId) || reps[0];
    onAssignLead(lead.id, rep.id, rep.name);
    toast.success(`Assigned "${lead.company}" to ${rep.name}`);
    setSelectedLead(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#063056]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Lead Routing & Assignment Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              {queue.length} Awaiting Assignment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Distribute newly assigned and inbound commercial leads across Team 1 executives based on capacity and expertise
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Client Company</th>
              <th className="py-3 px-4">Source & Industry</th>
              <th className="py-3 px-4">Deal Value</th>
              <th className="py-3 px-4">Smart Recommendation</th>
              <th className="py-3 px-4">Received</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                    <p className="font-semibold text-slate-700">All leads distributed</p>
                    <p className="text-[11px] text-slate-400">The Team 1 routing queue is currently empty.</p>
                  </div>
                </td>
              </tr>
            ) : (
              queue.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                  {/* Company & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#063056] flex items-center justify-center font-bold shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{lead.company}</div>
                        <div className="text-[11px] text-slate-400">{lead.contact} • {lead.country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Source & Industry */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{lead.industry}</div>
                    <div className="text-[10px] text-slate-400">{lead.source}</div>
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900 text-sm">
                    ${lead.value.toLocaleString()}
                  </td>

                  {/* AI Recommendation */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 text-[#063056] font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{lead.recommendedRep}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {lead.reason}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lead.timeReceived}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLead(lead);
                        const match = reps.find(r => r.name === lead.recommendedRep);
                        setTargetRepId(match ? match.id : reps[0]?.id || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#063056] text-white hover:bg-[#094173] text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal Dialog */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#063056]" />
                <h4 className="font-bold text-slate-900 text-sm">Assign Lead to Executive</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="font-bold text-slate-900">{selectedLead.company}</div>
                <div className="text-slate-500 mt-0.5">${selectedLead.value.toLocaleString()} • {selectedLead.industry}</div>
                <div className="mt-2 text-[11px] text-blue-900 bg-blue-50/80 p-2 rounded border border-blue-100">
                  💡 <strong>Recommendation:</strong> {selectedLead.reason}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Team 1 Sales Representative
                </label>
                <select
                  value={targetRepId}
                  onChange={(e) => setTargetRepId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056]"
                >
                  {reps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} ({rep.activeLeads} active leads, {rep.callsToday} calls today)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAssignment(selectedLead)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#063056] hover:bg-[#094173] transition shadow-2xs cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

