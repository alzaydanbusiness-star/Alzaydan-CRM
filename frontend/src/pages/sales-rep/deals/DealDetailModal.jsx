import React, { useState } from 'react';
import {
  Building,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldAlert,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { pipelineStages } from '../data/mockData';

export default function DealDetailModal({ deal, onClose, onSaveDeal }) {
  const [stage, setStage] = useState(deal.stage);
  const [probability, setProbability] = useState(deal.probability);
  const [nextAction, setNextAction] = useState(deal.nextAction);
  const [requestDiscount, setRequestDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('10');

  if (!deal) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveDeal({
      ...deal,
      stage,
      probability: Number(probability),
      nextAction
    });
    toast.success(`Updated deal details for ${deal.company}`);
    onClose();
  };

  const handleSendDiscountRequest = () => {
    toast.info(`Sent ${discountPercent}% discount request for ${deal.company} to Sales Manager for approval`);
    setRequestDiscount(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#063056]" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {deal.company}
              </h2>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Deal ID: <span className="font-mono text-slate-700">{deal.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Key Value & Timeline Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Deal Value
              </div>
              <div className="text-lg font-black text-slate-900 flex items-center mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600 -mr-0.5" />
                AED {deal.value.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Close Date
              </div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {deal.expectedClose}
              </div>
            </div>
          </div>

          {/* Stage & Probability Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
              >
                {pipelineStages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Win Probability: <span className="text-[#063056]">{probability}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full accent-[#063056] mt-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#063056]" />
              <span>Primary Decision Maker</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Name & Role</span>
                <span className="font-semibold text-slate-800">{deal.contact}</span>
                <span className="text-slate-500 block text-[11px]">{deal.role}</span>
              </div>
              <div className="space-y-1">
                <a
                  href={`tel:${deal.phone}`}
                  className="flex items-center gap-1.5 text-blue-700 hover:underline font-semibold"
                >
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{deal.phone}</span>
                </a>
                <a
                  href={`mailto:${deal.email}`}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{deal.email}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Next Action */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Next Action / Follow-up Plan
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
            />
          </div>

          {/* Manager Approval Request Section */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">
                  Special Pricing / Discount Approval
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRequestDiscount(!requestDiscount)}
                className="text-[11px] font-bold text-amber-800 hover:underline"
              >
                {requestDiscount ? 'Cancel' : 'Request from Manager'}
              </button>
            </div>

            {requestDiscount && (
              <div className="mt-3 pt-2 border-t border-amber-200/80 flex items-center gap-2">
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="px-2 py-1 text-xs bg-white border border-amber-300 rounded-lg outline-none"
                >
                  <option value="5">5% Volume Discount</option>
                  <option value="10">10% Standard Special</option>
                  <option value="15">15% Strategic Client Tier</option>
                </select>
                <button
                  type="button"
                  onClick={handleSendDiscountRequest}
                  className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800"
                >
                  Submit to Khalid Al-Mansoor
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{deal.daysInStage} days in {deal.stage}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E] shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
