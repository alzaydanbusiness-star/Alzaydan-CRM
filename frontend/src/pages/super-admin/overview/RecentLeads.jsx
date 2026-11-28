import React from 'react';
import { Filter } from 'lucide-react';

export default function RecentLeads({ leads = [], onViewAll }) {
  const displayLeads = leads;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#011635]" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Leads
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#011635] hover:underline cursor-pointer"
        >
          View All &rarr;
        </button>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-x-auto flex-1 flex flex-col justify-center">
        {displayLeads.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-1.5">
            <Filter className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-xs text-slate-600">No recent leads found</p>
            <p className="text-[11px] text-slate-400">New leads created in the Lead module will appear here.</p>
          </div>
        ) : (
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-100">
                <th className="pb-3 font-semibold">Lead Name</th>
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Assigned To</th>
                <th className="pb-3 font-semibold">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayLeads.slice(0, 4).map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-bold text-slate-900">
                    {lead.name}
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    {lead.company}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${lead.statusColor || 'bg-blue-50 text-blue-600 border-blue-200'}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs ${lead.avatarBg || 'bg-blue-600 text-white'}`}
                      >
                        {lead.assignedInitials || (lead.assignedTo ? lead.assignedTo.split(' ').map((n) => n[0]).join('') : 'AZ')}
                      </div>
                      <span className="text-slate-700 font-medium">
                        {lead.assignedTo}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px] font-medium">
                    {lead.createdOn || lead.date || 'Today'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
