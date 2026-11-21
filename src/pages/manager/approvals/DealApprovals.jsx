import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  AlertTriangle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function DealApprovals({ 
  approvals, 
  onApprove, 
  onReject 
}) {
  const [filter, setFilter] = useState('Pending');
  const [requesterFilter, setRequesterFilter] = useState('All');
  const [rejectingDeal, setRejectingDeal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredApprovals = approvals.filter(item => {
    // Status filter
    if (filter !== 'All') {
      if (item.status.toLowerCase() !== filter.toLowerCase()) {
        return false;
      }
    }

    // Requester filter
    if (requesterFilter === 'Team Leads') {
      const isLead = (item.repRole || '').toLowerCase().includes('lead') || item.requesterType === 'Team Lead';
      if (!isLead) return false;
    } else if (requesterFilter === 'Employees') {
      const isEmp = !(item.repRole || '').toLowerCase().includes('lead') || item.requesterType === 'Employee';
      if (!isEmp) return false;
    }

    return true;
  });

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason or counter-offer terms');
      return;
    }
    onReject(rejectingDeal.id, rejectReason);
    toast.error(`Request for ${rejectingDeal.client} rejected.`);
    setRejectingDeal(null);
    setRejectReason('');
  };

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Manager Approval Queue
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              {pendingCount} Pending Action{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sign off on discount requests, high-value contract tenders, site survey expenses, and credit payment terms submitted by Team Leads and employees.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Requester Filter */}
          <div className="relative">
            <select
              value={requesterFilter}
              onChange={(e) => setRequesterFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#063056] cursor-pointer"
            >
              <option value="All">All Requesters</option>
              <option value="Team Leads">Team Leads Only</option>
              <option value="Employees">Sales Execs Only</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
            {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
              const count = tab === 'All' 
                ? approvals.length 
                : approvals.filter(a => a.status.toLowerCase() === tab.toLowerCase()).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    filter === tab
                      ? 'bg-white text-[#063056] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === tab ? 'bg-[#063056] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Approvals Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Deal & Client</th>
              <th className="py-3 px-4">Request Type & Justification</th>
              <th className="py-3 px-4">Requested By</th>
              <th className="py-3 px-4">Deal Value</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                    <p className="font-semibold text-slate-600">Approval queue clear</p>
                    <p className="text-[11px] text-slate-400">No requests matching the selected filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredApprovals.map((deal) => {
                const isPending = deal.status === 'Pending';
                const isTeamLead = (deal.repRole || '').toLowerCase().includes('lead') || deal.requesterType === 'Team Lead';

                return (
                  <tr key={deal.id} className="hover:bg-slate-50/60 transition">
                    {/* Deal & Client */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#063056] flex items-center justify-center font-bold text-xs shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{deal.client}</div>
                          <div className="text-[11px] text-slate-400">{deal.country || 'UAE'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Request Details */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 mb-1 border border-slate-200/60">
                        {deal.type}
                      </div>
                      <div className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {deal.requestDetail}
                      </div>
                      {deal.requestedAt && (
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Submitted {deal.requestedAt}</span>
                        </div>
                      )}
                    </td>

                    {/* Requested By (Team Lead or Employee) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{deal.repName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isTeamLead 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {deal.repRole || (isTeamLead ? 'Team Lead' : 'Sales Exec')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{deal.teamName}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900 text-xs">
                      AED {deal.dealValue.toLocaleString()}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        deal.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : deal.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deal.priority === 'High' && <AlertTriangle className="w-3 h-3" />}
                        {deal.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        deal.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : deal.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {deal.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                        {deal.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {deal.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {deal.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onApprove(deal.id);
                              toast.success(`Approved ${deal.type} for ${deal.client}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingDeal(deal)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-semibold italic ${
                          deal.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {deal.status === 'Approved' ? 'Sign-off Granted' : 'Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Reason Modal Dialog */}
      {rejectingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-sm">Reject Request</h4>
              </div>
              <button
                type="button"
                onClick={() => setRejectingDeal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="font-bold text-slate-800">{rejectingDeal.client}</div>
                <div className="text-slate-500 mt-0.5">{rejectingDeal.type} • AED {rejectingDeal.dealValue.toLocaleString()}</div>
                <div className="text-slate-600 mt-2 italic bg-white p-2 rounded border border-slate-100">
                  "{rejectingDeal.requestDetail}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Manager Feedback / Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this request is rejected or provide counter terms (e.g. Cap discount at 7% or require upfront advance payment)..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingDeal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-2xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
