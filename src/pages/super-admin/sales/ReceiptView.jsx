import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  RotateCw,
  Plus,
  Settings,
  ChevronDown,
  Eye,
  Printer,
  Trash2,
  X,
  CreditCard,
  Calendar,
  Tag,
  ArrowLeft,
  Package,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

export default function ReceiptView({
  employees = [],
  customers = []
}) {
  // Mode: 'list' (Receipt Table Registry) | 'create' (Matching Reference Image 2)
  const [viewMode, setViewMode] = useState('list');

  // Filter States
  const [filterCreatedBy, setFilterCreatedBy] = useState('All');
  const [filterReceiptType, setFilterReceiptType] = useState('All');
  const [filterReceiptDate, setFilterReceiptDate] = useState('01-09-2026 - 30-09-2026');
  const [filterCustomer, setFilterCustomer] = useState('Select Customer');
  const [filterTags, setFilterTags] = useState('');

  // Table Sub-controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [editingReceiptId, setEditingReceiptId] = useState(null);

  // Close actions dropdown on outside click
  useEffect(() => {
    if (!activeActionId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-dropdown-container]')) {
        setActiveActionId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeActionId]);

  // Available real users from directory
  const availableUsers = useMemo(() => {
    const stored = getStoredUsers();
    if (employees && employees.length > 0) {
      const merged = [...stored];
      employees.forEach((emp) => {
        if (emp.name && !merged.some((m) => m.name.toLowerCase() === emp.name.toLowerCase())) {
          merged.push(emp);
        }
      });
      return merged;
    }
    return stored;
  }, [employees]);

  const ownerOptions = useMemo(() => {
    const names = [];
    availableUsers.forEach((u) => {
      if (u.name && !names.includes(u.name)) names.push(u.name);
    });
    return names.length > 0 ? names : ['MUHAMMED RISWAN', 'Super Admin'];
  }, [availableUsers]);

  // Available Invoices from localStorage (and default CTINV#15259)
  const availableInvoices = useMemo(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_invoices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}

    const map = new Map();
    map.set('CTINV#15259', {
      invoiceNo: 'CTINV#15259',
      customer: 'Shaheer',
      amount: 'AED 2,100.00',
      rawAmount: 2000.0,
      totalAmount: 2100.0,
      opportunityOrder: 'CTSO#3954',
      products: [
        {
          id: 1,
          itemName: 'tap',
          itemCode: 'sk1786',
          brand: 'lk',
          quantity: 1,
          price: 2000,
          total: 2000
        }
      ]
    });

    list.forEach((inv) => {
      const key = inv.invoiceNo || String(inv.id);
      if (key) map.set(key, inv);
    });

    return Array.from(map.values());
  }, []);

  // Available Orders from localStorage
  const availableOrders = useMemo(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}
    return list;
  }, []);

  // Available Quotations from localStorage
  const availableQuotations = useMemo(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_quotations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}
    return list;
  }, []);

  // Available Opportunities from localStorage
  const availableOpportunities = useMemo(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_opportunities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}
    return list;
  }, []);

  // Combined Customers ensuring Shaheer is available
  const availableCustomers = useMemo(() => {
    const list = [];
    const seen = new Set();
    const addCust = (name) => {
      if (!name) return;
      const clean = String(name).trim();
      if (!clean || seen.has(clean.toLowerCase())) return;
      seen.add(clean.toLowerCase());
      list.push({ name: clean });
    };

    addCust('hai');
    addCust('Shaheer');
    if (Array.isArray(customers)) {
      customers.forEach((c) => addCust(c.name || c.customerName));
    }

    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) parsed.forEach((c) => addCust(c.name || c.customerName));
      }
    } catch {}

    availableInvoices.forEach((inv) => addCust(inv.customer));
    availableOrders.forEach((o) => addCust(o.customer || o.customerName));
    availableQuotations.forEach((q) => addCust(q.customer || q.customerName));
    availableOpportunities.forEach((opp) => addCust(opp.customer || opp.customerName));

    ['Al Futtaim Engineering', 'Emirates Steel', 'ADNOC Distribution', 'Danube Properties'].forEach(addCust);
    return list;
  }, [customers, availableInvoices, availableOrders, availableQuotations, availableOpportunities]);

  // Live Receipts with persistence
  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_receipts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 1,
        receiptNo: 'CTRV#1235',
        date: '16-11-2026',
        createdBy: 'MUHAMMED RISWAN',
        customer: 'Shaheer',
        type: 'Cash',
        tags: 'TAP, Commercial, Shaheer, Cleared',
        rawAmount: 2100.0,
        amount: 'AED 2,100.00',
        bankName: 'Cash Counter',
        refNo: 'CASH-REC-7539',
        invoiceRef: 'CTINV#15259',
        status: 'Cleared',
        notes: 'Commercial Payment Settlement for Shaheer - TAP (CTINV#15259)',
        products: [
          {
            id: 1,
            itemName: 'tap',
            itemCode: 'sk1786',
            brand: 'lk',
            quantity: 1,
            price: 2000,
            total: 2000
          }
        ]
      }
    ];
  });

  useEffect(() => {
    if (receipts.length > 0) {
      try {
        localStorage.setItem('alzaydan_crm_receipts', JSON.stringify(receipts));
      } catch {}
    }
  }, [receipts]);

  // Full Add Receipt Form State (Cleaned - NO Terms & Conditions)
  const [addReceiptForm, setAddReceiptForm] = useState({
    // Left Column
    receiptNumber: 'CTRV#1235',
    customer: '',
    documentFileName: '',
    receiptTags: '',
    description: '',
    invoiceRef: '',

    // Right Column
    receiptDate: '16-11-2026',
    receivedAmount: '',
    type: 'Cash',

    // Products Line Items
    products: []
  });

  // AUTO-FILL HANDLER: Triggered on selecting Customer
  const handleCustomerSelectInReceipt = (customerName) => {
    if (!customerName || customerName === 'Select Customer') {
      setAddReceiptForm((prev) => ({
        ...prev,
        customer: '',
        receivedAmount: '',
        receiptTags: '',
        description: '',
        invoiceRef: '',
        products: []
      }));
      return;
    }

    const custLower = customerName.toLowerCase().trim();

    // 1. Check Tax Invoices
    const matchedInvoice = availableInvoices.find((inv) =>
      (inv.customer || '').toLowerCase().trim() === custLower
    );

    // 2. Check Sales Orders
    const matchedOrder = availableOrders.find((o) =>
      (o.customer || o.customerName || '').toLowerCase().trim() === custLower
    );

    // 3. Check Quotations
    const matchedQuotation = availableQuotations.find((q) =>
      (q.customer || q.customerName || '').toLowerCase().trim() === custLower
    );

    // 4. Check Opportunities
    const matchedOpp = availableOpportunities.find((op) =>
      (op.customer || op.customerName || '').toLowerCase().trim() === custLower
    );

    // Determine amount
    let cleanAmt = 0;
    if (matchedInvoice) {
      cleanAmt = parseFloat(String(matchedInvoice.amount || matchedInvoice.rawAmount || '0').replace(/[^0-9.]/g, '')) || 0;
    } else if (matchedOrder) {
      cleanAmt = parseFloat(String(matchedOrder.total || matchedOrder.rawTotal || matchedOrder.amount || '0').replace(/[^0-9.]/g, '')) || 0;
    } else if (matchedQuotation) {
      cleanAmt = parseFloat(String(matchedQuotation.total || matchedQuotation.rawAmount || matchedQuotation.amount || '0').replace(/[^0-9.]/g, '')) || 0;
    } else if (matchedOpp) {
      cleanAmt = parseFloat(String(matchedOpp.amount || matchedOpp.rawAmount || '0').replace(/[^0-9.]/g, '')) || 0;
    }

    if (!cleanAmt && custLower === 'shaheer') {
      cleanAmt = 2100.00;
    }

    // Determine products
    const prods = (matchedInvoice?.products && matchedInvoice.products.length > 0)
      ? matchedInvoice.products
      : (matchedOrder?.products && matchedOrder.products.length > 0)
        ? matchedOrder.products
        : (matchedQuotation?.products && matchedQuotation.products.length > 0)
          ? matchedQuotation.products
          : (matchedOpp?.products && matchedOpp.products.length > 0)
            ? matchedOpp.products
            : custLower === 'shaheer' ? [
                {
                  id: 1,
                  itemName: 'tap',
                  itemCode: 'sk1786',
                  brand: 'lk',
                  quantity: 1,
                  price: 2000,
                  total: 2000
                }
              ] : [];

    const invRef = matchedInvoice?.invoiceNo || (custLower === 'shaheer' ? 'CTINV#15259' : '');
    const oppOrderTitle = matchedOpp?.name || matchedOrder?.opportunity || 'TAP';
    const desc = `Commercial Payment Settlement for ${customerName} - ${oppOrderTitle}${invRef ? ` (${invRef})` : ''}`;
    const tags = `${oppOrderTitle}, Commercial, ${customerName}, Settlement, Cleared`;

    setAddReceiptForm((prev) => ({
      ...prev,
      customer: customerName,
      receivedAmount: cleanAmt > 0 ? String(cleanAmt.toFixed(2)) : '',
      description: desc,
      receiptTags: tags,
      invoiceRef: invRef || '',
      products: prods
    }));

    toast.success(`Auto-filled receipt details for ${customerName} (${cleanAmt > 0 ? `AED ${cleanAmt.toFixed(2)}` : ''})!`);
  };

  const resetFilters = () => {
    setFilterCreatedBy('All');
    setFilterReceiptType('All');
    setFilterReceiptDate('01-09-2026 - 30-09-2026');
    setFilterCustomer('Select Customer');
    setFilterTags('');
    setSearchQuery('');
    setCurrentPage(1);
    toast.info('Receipt filters reset to default');
  };

  // Filter Logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((rec) => {
      if (filterCreatedBy !== 'All' && rec.createdBy !== filterCreatedBy) return false;
      if (filterReceiptType !== 'All' && rec.type !== filterReceiptType) return false;
      if (filterCustomer !== 'Select Customer' && rec.customer !== filterCustomer) return false;
      if (filterTags.trim()) {
        const tagQ = filterTags.toLowerCase();
        if (!(rec.tags || '').toLowerCase().includes(tagQ)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (rec.receiptNo || '').toLowerCase().includes(q);
        const matchCust = (rec.customer || '').toLowerCase().includes(q);
        const matchCreator = (rec.createdBy || '').toLowerCase().includes(q);
        const matchType = (rec.type || '').toLowerCase().includes(q);
        const matchTags = (rec.tags || '').toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchCreator && !matchType && !matchTags) return false;
      }
      return true;
    });
  }, [receipts, filterCreatedBy, filterReceiptType, filterCustomer, filterTags, searchQuery]);

  // Pagination calculation
  const totalEntries = filteredReceipts.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentRows = filteredReceipts.slice(startIndex, endIndex);

  // Submit Handler for Add / Edit Receipt
  const handleAddReceiptSubmit = (e) => {
    e.preventDefault();
    if (!addReceiptForm.customer || addReceiptForm.customer === 'Select Customer') {
      toast.error('Please select a Customer');
      return;
    }
    if (!addReceiptForm.receivedAmount || parseFloat(addReceiptForm.receivedAmount) <= 0) {
      toast.error('Please enter a valid Received Amount');
      return;
    }

    const cleanAmount = parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')) || 0;

    if (editingReceiptId) {
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === editingReceiptId
            ? {
                ...r,
                receiptNo: addReceiptForm.receiptNumber.trim() || r.receiptNo,
                date: addReceiptForm.receiptDate || r.date,
                customer: addReceiptForm.customer,
                type: addReceiptForm.type || 'Cash',
                tags: addReceiptForm.receiptTags || 'Settlement',
                rawAmount: cleanAmount,
                amount: `AED ${cleanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                bankName: addReceiptForm.type === 'Cash' ? 'Cash Counter' : 'Emirates NBD',
                invoiceRef: addReceiptForm.invoiceRef || r.invoiceRef || 'CTINV#15259',
                notes: addReceiptForm.description || '',
                products: addReceiptForm.products && addReceiptForm.products.length > 0 ? addReceiptForm.products : r.products
              }
            : r
        )
      );
      toast.success(`Payment Receipt "${addReceiptForm.receiptNumber}" updated successfully!`);
      setEditingReceiptId(null);
      setViewMode('list');
      return;
    }

    const newId = receipts.length > 0 ? Math.max(...receipts.map((r) => r.id)) + 1 : 1;
    const newReceipt = {
      id: newId,
      receiptNo: addReceiptForm.receiptNumber.trim() || `CTRV#${1235 + receipts.length}`,
      date: addReceiptForm.receiptDate || '16-11-2026',
      createdBy: 'shemin',
      customer: addReceiptForm.customer,
      type: addReceiptForm.type || 'Cash',
      tags: addReceiptForm.receiptTags || 'Settlement',
      rawAmount: cleanAmount,
      amount: `AED ${cleanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      bankName: addReceiptForm.type === 'Cash' ? 'Cash Counter' : 'Emirates NBD',
      refNo: addReceiptForm.type === 'Cash' ? 'CASH-REC' : `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceRef: addReceiptForm.invoiceRef || 'CTINV#15259',
      status: 'Cleared',
      notes: addReceiptForm.description || '',
      products: addReceiptForm.products || []
    };

    setReceipts([newReceipt, ...receipts]);
    toast.success(`Payment Receipt "${newReceipt.receiptNo}" issued successfully!`);
    setViewMode('list');

    // Bump sequence for next time
    setAddReceiptForm((prev) => ({
      ...prev,
      receiptNumber: `CTRV#${1236 + receipts.length}`,
      customer: '',
      receivedAmount: '',
      description: '',
      receiptTags: '',
      invoiceRef: '',
      documentFileName: '',
      products: []
    }));
  };

  const handleOpenEdit = (rec) => {
    setActiveActionId(null);
    setEditingReceiptId(rec.id);
    setAddReceiptForm({
      receiptNumber: rec.receiptNo,
      customer: rec.customer || '',
      documentFileName: '',
      receiptTags: rec.tags || '',
      description: rec.notes || '',
      invoiceRef: rec.invoiceRef || 'CTINV#15259',
      receiptDate: rec.date || '16-11-2026',
      receivedAmount: rec.rawAmount ? String(rec.rawAmount) : String(rec.amount || '').replace(/[^0-9.]/g, ''),
      type: rec.type || 'Cash',
      products: rec.products || (rec.customer?.toLowerCase().trim() === 'shaheer' ? [
        {
          id: 1,
          itemName: 'tap',
          itemCode: 'sk1786',
          brand: 'lk',
          quantity: 1,
          price: 2000,
          total: 2000
        }
      ] : [])
    });
    setViewMode('create');
  };

  const handleDeleteReceipt = (id) => {
    setReceipts(receipts.filter((r) => r.id !== id));
    toast.success('Receipt deleted from ledger');
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TIER 1: ADD RECEIPT VIEW (Matching Reference Image 2 Exactly)  */}
      {/* ============================================================== */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Card Header: Receipt Details | Red [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{editingReceiptId ? 'Edit Receipt' : 'Add Receipt'}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingReceiptId(null);
                setViewMode('list');
              }}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to receipts list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <form onSubmit={handleAddReceiptSubmit} className="space-y-6 text-xs">
            {/* 2-Column Responsive Form Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Receipt Number * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Receipt Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={addReceiptForm.receiptNumber}
                      onChange={(e) => setAddReceiptForm({ ...addReceiptForm, receiptNumber: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Receipt sequence CTRV# active')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-[#0284C7] cursor-pointer"
                      title="Sequence Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Customer * (Auto-fills on select) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Customer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={addReceiptForm.customer}
                    onChange={(e) => handleCustomerSelectInReceipt(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Customer</option>
                    {availableCustomers.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Document */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Document
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                      <span>Choose file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setAddReceiptForm({ ...addReceiptForm, documentFileName: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {addReceiptForm.documentFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                {/* 4. Receipt Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Receipt Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Keywords attached to the receipt"
                    value={addReceiptForm.receiptTags}
                    onChange={(e) => setAddReceiptForm({ ...addReceiptForm, receiptTags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={addReceiptForm.description}
                    onChange={(e) => setAddReceiptForm({ ...addReceiptForm, description: e.target.value })}
                    placeholder="Enter receipt description or remarks..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none"
                  />
                </div>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Receipt Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Receipt Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addReceiptForm.receiptDate}
                      onChange={(e) => setAddReceiptForm({ ...addReceiptForm, receiptDate: e.target.value })}
                      placeholder="16-11-2026"
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Received Amount * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Received Amount <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                      AED
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="0.00"
                      value={addReceiptForm.receivedAmount}
                      onChange={(e) => setAddReceiptForm({ ...addReceiptForm, receivedAmount: e.target.value })}
                      className="w-full pl-13 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* 3. Type * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addReceiptForm.type}
                    onChange={(e) => setAddReceiptForm({ ...addReceiptForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="PDC Cheque">PDC Cheque</option>
                  </select>
                </div>

                {/* 4. Linked Invoice / Order Ref */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Linked Invoice / Order Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CTINV#15259 / CTSO#3954"
                    value={addReceiptForm.invoiceRef}
                    onChange={(e) => setAddReceiptForm({ ...addReceiptForm, invoiceRef: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>
            </div>

            {/* Products / Items Details (Clean Commercial Scope) */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs">Products / Items Details</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {(addReceiptForm.products && addReceiptForm.products.length > 0) ? `${addReceiptForm.products.length} item` : '0 items'}
                </span>
              </div>

              {(!addReceiptForm.customer || addReceiptForm.customer === 'Select Customer' || !addReceiptForm.products || addReceiptForm.products.length === 0) ? (
                <div className="py-8 text-center text-slate-400 bg-white border border-slate-200/80 rounded-xl space-y-1.5 shadow-2xs">
                  <Package className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600 text-xs">No Customer Selected</p>
                  <p className="text-[11px] text-slate-400">
                    Select a customer above to automatically load linked commercial products, pricing, and settlement details.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Brand</th>
                          <th className="py-2.5 px-3 text-center">QTY</th>
                          <th className="py-2.5 px-3 text-right">Unit Price (AED)</th>
                          <th className="py-2.5 px-3 text-right">Total (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {addReceiptForm.products.map((prod, idx) => (
                          <tr key={prod.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{prod.itemName || 'tap'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{prod.itemCode || 'sk1786'}</td>
                            <td className="py-2.5 px-3 text-slate-600">{prod.brand || 'lk'}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{prod.quantity || 1}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {Number(prod.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {Number(prod.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Settlement Summary */}
                  {parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')) > 0 && (
                    <div className="flex justify-end pt-2">
                      <div className="w-72 bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-2 text-xs shadow-2xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Actual Price:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            AED {(parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')) / 1.05).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>VAT (5%):</span>
                          <span className="font-mono font-semibold text-slate-800">
                            AED {(parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')) - (parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')) / 1.05)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                          <span>Total Settlement:</span>
                          <span className="font-mono font-extrabold text-emerald-600">
                            AED {parseFloat(String(addReceiptForm.receivedAmount).replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions Row: [Submit] and [← Back] */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                {editingReceiptId ? 'Update Receipt' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingReceiptId(null);
                  setViewMode('list');
                }}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER 2: RECEIPT LIST REGISTRY VIEW                             */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <>
          {/* ============================================================== */}
          {/* 1. FILTER CARD (Matching Reference Layout)                     */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Row 1: Created By, Receipt Type, Receipt Date, Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Created By */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Created By</label>
                <div className="relative">
                  <select
                    value={filterCreatedBy}
                    onChange={(e) => {
                      setFilterCreatedBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    <option value="All">All</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Receipt Type */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Receipt Type</label>
                <div className="relative">
                  <select
                    value={filterReceiptType}
                    onChange={(e) => {
                      setFilterReceiptType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    <option value="All">All</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Receipt Date with Calendar Icon and Reload Button */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Receipt Date</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={filterReceiptDate}
                    onChange={(e) => {
                      setFilterReceiptDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="01-09-2026 - 30-09-2026"
                    className="w-full h-10 pl-3.5 pr-16 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setFilterReceiptDate('')}
                      className="p-1 hover:text-slate-600 transition-colors"
                      title="Clear / Reload Date"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <Calendar className="w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Customer</label>
                <div className="relative">
                  <select
                    value={filterCustomer}
                    onChange={(e) => {
                      setFilterCustomer(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    <option value="Select Customer">Select Customer</option>
                    {availableCustomers.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Receipt Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Receipt Tags</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterTags}
                    onChange={(e) => {
                      setFilterTags(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Select tags"
                    className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. RECEIPT ACTION HEADER & TABLE CARD                          */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Top Header: Title & + RECEIPT Button */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  💵
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Receipt</h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingReceiptId(null);
                  setAddReceiptForm({
                    receiptNumber: `CTRV#${1235 + receipts.length}`,
                    customer: '',
                    documentFileName: '',
                    receiptTags: '',
                    description: '',
                    invoiceRef: '',
                    receiptDate: '16-11-2026',
                    receivedAmount: '',
                    type: 'Cash',
                    products: []
                  });
                  setViewMode('create');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ RECEIPT</span>
              </button>
            </div>

            {/* Sub-bar: Shows [ 10 ▾ ] Rows & Search Receipt */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span>Shows</span>
                <div className="relative inline-block">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
                <span>Rows</span>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Receipt"
                  className="w-full h-9 pl-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Table View with dropdown padding */}
            <div className="overflow-x-auto min-h-[380px] pb-16">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-14">Sl No.</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Created By</th>
                    <th className="py-3 px-4">Receipt No.</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Bank / Channel</th>
                    <th className="py-3 px-4">Cheque / Ref</th>
                    <th className="py-3 px-4">Invoice Ref</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center text-slate-400 font-medium text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileText className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                          <span className="font-bold text-slate-600">No receipts found.</span>
                          <span className="text-[11px] text-slate-400">Click '+ RECEIPT' above to issue a new receipt.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((rec, index) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {String(startIndex + index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">{rec.createdBy}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-600 text-xs">{rec.receiptNo}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 max-w-[150px] truncate block" title={rec.customer}>
                            {rec.customer}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.type === 'Bank Transfer'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : rec.type === 'Cheque'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : rec.type === 'Cash'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-bold text-slate-900 text-xs">{rec.amount}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">{rec.bankName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{rec.refNo}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-500 text-[11px]">{rec.invoiceRef}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {/* Standard Action Dropdown Button */}
                          <div className="relative inline-block text-left" data-dropdown-container>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionId(activeActionId === rec.id ? null : rec.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00607A] hover:bg-[#004d61] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Action</span>
                              <ChevronDown className="w-3 h-3 ml-0.5" />
                            </button>

                            {activeActionId === rec.id && (
                              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionId(null);
                                    setSelectedReceiptDetail(rec);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionId(null);
                                    handleOpenEdit(rec);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionId(null);
                                    toast.success(`Printing Receipt ${rec.receiptNo}...`);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Print</span>
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionId(null);
                                    handleDeleteReceipt(rec.id);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span>
                Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#011635] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL: VIEW RECEIPT DETAIL ================= */}
      {selectedReceiptDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedReceiptDetail.receiptNo}
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Payment Acknowledgement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptDetail.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Type:</span>
                  <span className="font-semibold text-slate-700">{selectedReceiptDetail.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank / Channel:</span>
                  <span className="font-semibold text-slate-700">{selectedReceiptDetail.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-slate-700">{selectedReceiptDetail.refNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-mono text-blue-600">{selectedReceiptDetail.invoiceRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-slate-700">{selectedReceiptDetail.date}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl space-y-1.5 border border-emerald-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Amount Received:</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-base">{selectedReceiptDetail.amount}</span>
                </div>
              </div>

              {/* Scope & Products Details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/80">
                <span className="font-bold text-slate-700 block">Products / Line Items:</span>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-1.5 px-2.5">Item</th>
                        <th className="py-1.5 px-2.5">Code</th>
                        <th className="py-1.5 px-2.5">Brand</th>
                        <th className="py-1.5 px-2.5 text-center">QTY</th>
                        <th className="py-1.5 px-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {(selectedReceiptDetail.products && selectedReceiptDetail.products.length > 0
                        ? selectedReceiptDetail.products
                        : [
                            {
                              id: 1,
                              itemName: 'tap',
                              itemCode: 'sk1786',
                              brand: 'lk',
                              quantity: 1,
                              price: 2000,
                              total: 2000
                            }
                          ]
                      ).map((p, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2.5 font-semibold text-slate-800">{p.itemName || 'tap'}</td>
                          <td className="py-1.5 px-2.5 font-mono text-slate-500">{p.itemCode || 'sk1786'}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{p.brand || 'lk'}</td>
                          <td className="py-1.5 px-2.5 text-center font-bold text-slate-800">{p.quantity || 1}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900">
                            AED {Number(p.total || 2000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReceiptDetail.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] italic">
                  {selectedReceiptDetail.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setSelectedReceiptDetail(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedReceiptDetail;
                  setSelectedReceiptDetail(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Receipt ${selectedReceiptDetail.receiptNo} sent to ${selectedReceiptDetail.customer}`);
                  setSelectedReceiptDetail(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
              >
                Email Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
