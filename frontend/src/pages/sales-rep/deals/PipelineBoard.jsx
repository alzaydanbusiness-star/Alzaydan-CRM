import React, { useState } from 'react';
import {
  Kanban,
  Building,
  DollarSign,
  User,
  ChevronRight,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { pipelineStages } from '../data/mockData';

export default function PipelineBoard({ deals, onUpdateDealStage, onSelectDeal, onAddDeal }) {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newStage, setNewStage] = useState('discovery');

  const handleCreateDeal = (e) => {
    e.preventDefault();
    if (!newCompany.trim() || !newValue) {
      toast.error('Please enter company name and deal value');
      return;
    }

    const created = {
      id: `deal-${Date.now()}`,
      company: newCompany.trim(),
      value: Number(newValue),
      stage: newStage,
      contact: newContact.trim() || 'Contact Person Pending',
      role: 'Commercial Contact',
      phone: '+971 4 000 0000',
      email: 'contact@client.ae',
      probability: newStage === 'negotiation' ? 75 : newStage === 'proposal' ? 50 : 30,
      expectedClose: 'Dec 15, 2026',
      priority: 'High',
      nextAction: 'Initial qualification & discovery call',
      daysInStage: 1
    };

    onAddDeal(created);
    toast.success(`Deal created for ${newCompany}!`);
    setNewCompany('');
    setNewValue('');
    setNewContact('');
    setShowNewDealModal(false);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  const getStageNext = (currentStage) => {
    if (currentStage === 'discovery') return 'proposal';
    if (currentStage === 'proposal') return 'negotiation';
    if (currentStage === 'negotiation') return 'won';
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Kanban className="w-5 h-5 text-[#063056]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Personal Deal Pipeline Board
            </h2>
            <p className="text-xs text-slate-500">
              Drag-free, high-precision deal progression with UAE commercial clients
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewDealModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#063056] text-white text-xs font-bold rounded-xl hover:bg-[#083E6E] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Deal</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const totalStageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col h-full min-h-[500px]"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {stage.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-[#063056]">
                  AED {totalStageValue.toLocaleString()}
                </div>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                    No active deals in this stage
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const nextStage = getStageNext(deal.stage);

                    return (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs hover:border-[#063056]/40 transition-all space-y-2.5 group"
                      >
                        {/* Company & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => onSelectDeal(deal)}
                            className="font-bold text-xs text-slate-900 hover:text-[#1D4ED8] text-left transition-colors flex items-center gap-1.5"
                          >
                            <Building className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1D4ED8]" />
                            <span className="line-clamp-1">{deal.company}</span>
                          </button>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getPriorityBadge(
                              deal.priority
                            )}`}
                          >
                            {deal.priority}
                          </span>
                        </div>

                        {/* Value & Probability */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-extrabold text-slate-900 flex items-center text-sm">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
                            AED {deal.value.toLocaleString()}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {deal.probability}% Prob.
                          </span>
                        </div>

                        {/* Contact Person */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            {deal.contact}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{deal.daysInStage}d here</span>
                          </div>
                        </div>

                        {/* Next Action */}
                        <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 border border-slate-100/80">
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">
                            Next Action:
                          </span>
                          <span className="line-clamp-1">{deal.nextAction}</span>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-1 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => onSelectDeal(deal)}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>Details</span>
                          </button>

                          {nextStage && (
                            <button
                              onClick={() => {
                                onUpdateDealStage(deal.id, nextStage);
                                toast.success(`Advanced ${deal.company} to ${nextStage.toUpperCase()}`);
                              }}
                              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/60 transition-colors"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {deal.stage === 'won' && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Closed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#063056]" />
                <h3 className="font-bold text-base text-slate-900">Add New Commercial Deal</h3>
              </div>
              <button
                onClick={() => setShowNewDealModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client / Company Name
                </label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Al Habtoor Group"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deal Value (AED)
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 150000"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person & Title
                </label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="e.g. Tariq Al-Suwaidi (Procurement Manager)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Pipeline Stage
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                >
                  <option value="discovery">Discovery & Qualification</option>
                  <option value="proposal">Proposal & Demo</option>
                  <option value="negotiation">Contract & Negotiation</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E]"
                >
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
