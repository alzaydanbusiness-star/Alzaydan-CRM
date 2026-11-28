import React, { useState } from 'react';
import { X, FileText, CheckCircle2, DollarSign, TrendingUp, ShoppingCart, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

export default function CreateSalesModal({
  isOpen,
  onClose,
  onAddTransaction,
  onAddOpportunity,
  initialType = 'Opportunity',
  employees = [],
  customers = []
}) {
  const userList = employees && employees.length > 0 ? employees : getStoredUsers();
  const [docType, setDocType] = useState(initialType || 'Opportunity'); // 'Opportunity' | 'Quotation' | 'Order' | 'Invoice'
  const [title, setTitle] = useState('');
  const [client, setClient] = useState(customers[0]?.name || '');
  const [customClient, setCustomClient] = useState('');
  const [amount, setAmount] = useState('');
  const [salesRep, setSalesRep] = useState(userList[0]?.name || 'Super Admin');
  const [stage, setStage] = useState('Proposal');
  const [probability, setProbability] = useState('60');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) {
      toast.error('Please enter a valid amount / deal value.');
      return;
    }

    const clientName = client === 'other' ? (customClient || 'Custom Client') : client;
    const cleanAmount = Number(amount.replace(/[^0-9.]/g, ''));
    const formattedAmount = `$${cleanAmount.toLocaleString()}`;

    if (docType === 'Opportunity') {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const randCode = `OPP-${randNum}`;
      const oppTitle = title.trim() || `${clientName} Commercial Expansion`;
      const oppDateFormatted = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const oppAmount = `AED ${cleanAmount.toLocaleString()}`;

      const newOpp = {
        id: randCode,
        code: randCode,
        opportunityNumber: randCode,
        name: oppTitle,
        title: oppTitle,
        client: clientName,
        customer: clientName,
        customerName: clientName,
        contact: 'Commercial Director',
        pointOfContact: 'Commercial Director',
        value: oppAmount,
        amount: oppAmount,
        numericValue: cleanAmount,
        stage: stage,
        probability: Number(probability) || 50,
        winProbability: Number(probability) || 50,
        expectedClose: dueDate || '28-11-2026',
        closeDate: dueDate || '28-11-2026',
        owner: salesRep,
        salesRep: salesRep,
        opportunityOwner: salesRep,
        ownerAvatarBg: 'bg-[#011635] text-white',
        oppDate: oppDateFormatted,
        assignedDate: oppDateFormatted,
        lastActivity: oppDateFormatted,
        lastActivityDays: 'Today',
        classification: 'A - Enterprise',
        bizType: 'New Business',
        rating: 'WARM',
        priority: cleanAmount > 200000 ? 'High' : 'Medium',
        nextAction: notes || 'Proposal review with decision committee',
        status: 'Open'
      };

      if (onAddOpportunity) onAddOpportunity(newOpp);
      toast.success(`Opportunity "${newOpp.name}" created successfully!`);
    } else {
      let prefix = 'SO';
      if (docType === 'Tax Invoice' || docType === 'Invoice') prefix = 'INV';
      else if (docType === 'Commercial Offers' || docType === 'Quotation') prefix = 'CO';
      else if (docType === 'Receipt') prefix = 'REC';

      const randNum = Math.floor(1000 + Math.random() * 9000);
      const newDocId = `${prefix}-2026-${randNum}`;

      const newTransaction = {
        id: newDocId,
        type: docType === 'Quotation' ? 'Commercial Offers' : docType === 'Order' ? 'Sales Order' : docType === 'Invoice' ? 'Tax Invoice' : docType,
        client: clientName,
        contact: 'Procurement Director',
        amount: formattedAmount,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dueDate: dueDate || '14 Days Net',
        salesRep: salesRep,
        status: docType === 'Receipt' ? 'Paid' : 'Pending',
        itemsCount: 5,
        notes: notes || 'Standard commercial supply terms.'
      };

      if (onAddTransaction) onAddTransaction(newTransaction);
      toast.success(`${docType === 'Invoice' ? 'Tax Invoice' : docType === 'Quotation' ? 'Quotation' : 'Sales Order'} "${newDocId}" generated!`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              {docType === 'Opportunity' && <TrendingUp className="w-4 h-4" />}
              {docType === 'Quotation' && <FileText className="w-4 h-4" />}
              {docType === 'Order' && <ShoppingCart className="w-4 h-4" />}
              {docType === 'Invoice' && <Receipt className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {docType === 'Opportunity' && 'Create Sales Opportunity'}
                {docType === 'Quotation' && 'Create Commercial Quotation'}
                {docType === 'Order' && 'Create Sales Order'}
                {docType === 'Invoice' && 'Generate Tax Invoice'}
              </h3>
              <p className="text-[11px] text-slate-500">Record commercial deal or billing document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Document Type Selector (All 4 Types: Opportunity, Quotation, Sales Order, Tax Invoice) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Commercial Category</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { type: 'Opportunity', label: 'Opportunity' },
                { type: 'Quotation', label: 'Quotation' },
                { type: 'Sales Order', label: 'Sales Order' },
                { type: 'Tax Invoice', label: 'Tax Invoice' },
                { type: 'Receipt', label: 'Receipt' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setDocType(item.type)}
                  className={`py-1.5 px-2.5 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    docType === item.type
                      ? 'bg-[#0055D4] text-white border-[#0055D4] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunity Title (if Opportunity) */}
          {docType === 'Opportunity' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title / Deal Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Logistics Modernization"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
              />
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client / Enterprise Account</label>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
              <option value="other">+ Enter Custom Client Name...</option>
            </select>
          </div>

          {client === 'other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Client Name</label>
              <input
                type="text"
                value={customClient}
                onChange={(e) => setCustomClient(e.target.value)}
                placeholder="e.g. Al Futtaim Logistics LLC"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
              />
            </div>
          )}

          {/* Amount / Value and Sales Rep */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {docType === 'Opportunity' ? 'Estimated Value ($)' : 'Amount ($ USD / AED)'}
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 150000"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sales Representative</label>
              <select
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none cursor-pointer"
              >
                {userList.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role || emp.department || 'Commercial Sales'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opportunity Specific Fields: Stage & Probability */}
          {docType === 'Opportunity' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none cursor-pointer"
                >
                  <option value="Discovery">Discovery & Qualification</option>
                  <option value="Proposal">Proposal & Spec</option>
                  <option value="Negotiation">Contract & Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Win Probability (%)</label>
                <select
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none cursor-pointer"
                >
                  <option value="25">25% (Early Discovery)</option>
                  <option value="50">50% (Proposal In Review)</option>
                  <option value="75">75% (Final Negotiation)</option>
                  <option value="90">90% (Verbal Agreement)</option>
                  <option value="100">100% (Closed Won)</option>
                </select>
              </div>
            </div>
          )}

          {/* Due Date / Close Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {docType === 'Opportunity' ? 'Expected Close Date' : 'Payment Term / Due Date'}
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder={docType === 'Opportunity' ? 'e.g. Dec 15, 2026' : 'e.g. Nov 30, 2026 (Net 30 Days)'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
            />
          </div>

          {/* Scope / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {docType === 'Opportunity' ? 'Next Action / Milestone' : 'Commercial Notes'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={docType === 'Opportunity' ? 'e.g. Committee demo scheduled for next Tuesday...' : 'Scope of supply, payment milestone...'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E] shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save {docType}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
