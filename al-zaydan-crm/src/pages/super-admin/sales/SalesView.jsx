import React from 'react';
import {
  KeyRound,
  FileText,
  ThumbsUp,
  ReceiptText,
  BadgeDollarSign
} from 'lucide-react';

import OpportunityView from './OpportunityView';
import CommercialOfferView from './CommercialOfferView';
import SalesOrderView from './SalesOrderView';
import TaxInvoiceView from './TaxInvoiceView';
import ReceiptView from './ReceiptView';

export default function SalesView({
  transactions = [],
  _setTransactions = () => {},
  opportunities = [],
  setOpportunities = () => {},
  employees = [],
  customers = [],
  leads = [],
  activeSubTab = 'Opportunity',
  setActiveSubTab
}) {
  // Subtab counts
  const countOpp = opportunities.length;
  const countCommercialOffers = transactions.filter(
    (t) => t.type === 'Commercial Offers' || t.type === 'Quotation'
  ).length;
  const countSalesOrders = transactions.filter(
    (t) => t.type === 'Sales Order' || t.type === 'Order'
  ).length;
  const countTaxInvoices = transactions.filter(
    (t) => t.type === 'Tax Invoice' || t.type === 'Invoice'
  ).length;
  const countReceipts = transactions.filter((t) => t.type === 'Receipt').length;

  const salesTabs = [
    { id: 'Opportunity', label: 'Opportunity', count: countOpp, icon: KeyRound },
    { id: 'Quotation', label: 'Quotation', count: countCommercialOffers, icon: FileText },
    { id: 'Sales Order', label: 'Sales Order', count: countSalesOrders, icon: ThumbsUp },
    { id: 'Tax Invoice', label: 'Tax Invoice', count: countTaxInvoices, icon: ReceiptText },
    { id: 'Receipt', label: 'Receipt', count: countReceipts, icon: BadgeDollarSign }
  ];

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TOP COMMERCIAL SUB-NAV RIBBON (5 Active Commercial Sections)    */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {salesTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeSubTab === tab.id ||
              (tab.id === 'Quotation' && (activeSubTab === 'Commercial Offers' || activeSubTab === 'Quotation' || activeSubTab === 'Quotations')) ||
              (tab.id === 'Sales Order' && (activeSubTab === 'Sales Order' || activeSubTab === 'Order')) ||
              (tab.id === 'Tax Invoice' && (activeSubTab === 'Tax Invoice' || activeSubTab === 'Invoice'));

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#011635] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white font-mono'
                      : 'bg-slate-100 text-slate-600 font-mono'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 font-medium hidden md:block shrink-0">
          Commercial Operations &bull; Al Zaydan FZE
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. OPPORTUNITY UI (Matching Reference Image 1 Exactly)        */}
      {/* ============================================================== */}
      {activeSubTab === 'Opportunity' && (
        <OpportunityView
          employees={employees}
          customers={customers}
          leads={leads}
          opportunities={opportunities}
          setOpportunities={setOpportunities}
        />
      )}

      {/* ============================================================== */}
      {/* 2. QUOTATION UI (Matching Reference Image 2 & 3 Exactly)       */}
      {/* ============================================================== */}
      {(activeSubTab === 'Commercial Offers' || activeSubTab === 'Quotation' || activeSubTab === 'Quotations') && (
        <CommercialOfferView
          employees={employees}
          customers={customers}
          opportunities={opportunities}
          leads={leads}
        />
      )}

      {/* ============================================================== */}
      {/* 3. SALES ORDER UI (Matching Reference Image 3 Exactly)         */}
      {/* ============================================================== */}
      {(activeSubTab === 'Sales Order' || activeSubTab === 'Order') && (
        <SalesOrderView
          employees={employees}
          customers={customers}
          opportunities={opportunities}
          leads={leads}
        />
      )}

      {/* ============================================================== */}
      {/* 4. TAX INVOICE UI (Matching Reference Image 1 Exactly)         */}
      {/* ============================================================== */}
      {(activeSubTab === 'Tax Invoice' || activeSubTab === 'Invoice') && (
        <TaxInvoiceView
          employees={employees}
          customers={customers}
          opportunities={opportunities}
        />
      )}

      {/* ============================================================== */}
      {/* 5. RECEIPT UI (Matching Reference Image 2 Exactly)             */}
      {/* ============================================================== */}
      {activeSubTab === 'Receipt' && (
        <ReceiptView employees={employees} customers={customers} />
      )}
    </div>
  );
}
