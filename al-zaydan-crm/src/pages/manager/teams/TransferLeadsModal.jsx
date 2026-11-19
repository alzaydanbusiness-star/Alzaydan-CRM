import React, { useState } from 'react';
import {
  ArrowRightLeft,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function TransferLeadsModal({ 
  isOpen, 
  onClose, 
  teams, 
  onReallocate 
}) {
  const [sourceTeam, setSourceTeam] = useState(teams[0]?.id || 'team-1');
  const [targetTeam, setTargetTeam] = useState(teams[1]?.id || 'team-2');
  const [leadCount, setLeadCount] = useState(10);
  const [reallocateType, setReallocateType] = useState('New Inquiries');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (sourceTeam === targetTeam) {
      toast.error('Source team and Target team cannot be the same');
      return;
    }

    const sourceObj = teams.find(t => t.id === sourceTeam);
    const targetObj = teams.find(t => t.id === targetTeam);

    if (onReallocate) {
      onReallocate({
        sourceTeam,
        targetTeam,
        leadCount: Number(leadCount),
        type: reallocateType,
        notes
      });
    }

    toast.success(`Successfully reallocated ${leadCount} ${reallocateType} from ${sourceObj?.name} to ${targetObj?.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#063056] text-white flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reallocate Leads Between Teams</h3>
              <p className="text-[11px] text-slate-500">Balance lead volume between Team 1, 2, and 3</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Source Team */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Source Team (Transfer From)
            </label>
            <select
              value={sourceTeam}
              onChange={(e) => setSourceTeam(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056]"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} — Lead: {t.lead} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Target Team */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Team (Transfer To)
            </label>
            <select
              value={targetTeam}
              onChange={(e) => setTargetTeam(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056]"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === sourceTeam}>
                  {t.name} — Lead: {t.lead} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Number of Leads */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Number of Leads
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={leadCount}
                onChange={(e) => setLeadCount(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056]"
              />
            </div>

            {/* Lead Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pipeline Stage Category
              </label>
              <select
                value={reallocateType}
                onChange={(e) => setReallocateType(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056]"
              >
                <option value="New Inquiries">New Inquiries</option>
                <option value="Qualified Leads">Qualified Leads</option>
                <option value="Stalled / Inactive Leads">Stalled / Inactive Leads</option>
                <option value="High Priority Accounts">High Priority Accounts</option>
              </select>
            </div>
          </div>

          {/* Allocation Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Manager Instruction / Reason Note (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rebalancing workload to support Team 2's Q4 push..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Assigned accounts will be immediately redistributed to the target Team Lead's routing queue with SLA notifications dispatched.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#063056] hover:bg-[#094173] transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Confirm Reallocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
