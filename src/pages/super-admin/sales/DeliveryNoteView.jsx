import React, { useState, useMemo } from 'react';
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
  PackageCheck,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

export default function DeliveryNoteView({
  employees = [],
  customers = []
}) {
  // Filter States
  const [filterOwner, setFilterOwner] = useState('All Owners');
  const [filterOrder, setFilterOrder] = useState('Select Order');
  const [filterInvoice, setFilterInvoice] = useState('Select Invoice');
  const [filterType, setFilterType] = useState('All');
  const [filterCostUpdate, setFilterCostUpdate] = useState('All');

  // Sub-controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNoteDetail, setSelectedNoteDetail] = useState(null);

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

  const defaultOwner = availableUsers[0]?.name || 'Super Admin';

  const ownerOptions = useMemo(() => {
    const names = [];
    availableUsers.forEach((u) => {
      if (u.name && !names.includes(u.name)) names.push(u.name);
    });
    return names.length > 0 ? names : ['Super Admin'];
  }, [availableUsers]);

  // Live Delivery Notes (Clean state with 0 mock data)
  const [deliveryNotes, setDeliveryNotes] = useState([]);

  // Full Add Delivery Note Form State (Matching Reference Image 1 Exactly)
  const [addNoteForm, setAddNoteForm] = useState({
    owner: defaultOwner,
    type: 'Customer Delivery Note',
    deliveryNumber: 'CTDN#1094',
    date: '16-11-2026',
    order: '',
    orderName: '',
    orderNumber: '',
    store: 'Main Warehouse - Mussafah',
    invoice: '',
    lpo: '',
    lpoDate: '',
    approvedBy: 'shemin',
    approvedContactNumber: '+971 56 887 8305',
    receivedBy: '',
    location: '',
    stateRegion: 'Abu Dhabi',
    contactNumber: '',
    reference: '',
    remarks: '',
    updateMaterialCost: true
  });

  const resetFilters = () => {
    setFilterOwner('All Owners');
    setFilterOrder('Select Order');
    setFilterInvoice('Select Invoice');
    setFilterType('All');
    setFilterCostUpdate('All');
    setSearchQuery('');
    setCurrentPage(1);
    toast.info('Delivery Note filters reset to default');
  };

  // Filter Logic
  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter((note) => {
      if (filterOwner !== 'All Owners' && note.owner !== filterOwner) return false;
      if (filterOrder !== 'Select Order' && note.order !== filterOrder) return false;
      if (filterInvoice !== 'Select Invoice' && note.invoice !== filterInvoice) return false;
      if (filterType !== 'All' && note.type !== filterType) return false;
      if (filterCostUpdate !== 'All' && note.costUpdate !== filterCostUpdate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (note.number || '').toLowerCase().includes(q);
        const matchCust = (note.customer || '').toLowerCase().includes(q);
        const matchOwner = (note.owner || '').toLowerCase().includes(q);
        const matchOrder = (note.order || '').toLowerCase().includes(q);
        const matchLoc = (note.location || '').toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchOwner && !matchOrder && !matchLoc) return false;
      }
      return true;
    });
  }, [deliveryNotes, filterOwner, filterOrder, filterInvoice, filterType, filterCostUpdate, searchQuery]);

  // Pagination calculation
  const totalEntries = filteredNotes.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentRows = filteredNotes.slice(startIndex, endIndex);

  // Submit Handler for Add Delivery Note (Image 1)
  const handleAddDeliveryNoteSubmit = (e) => {
    e.preventDefault();
    if (!addNoteForm.deliveryNumber.trim()) {
      toast.error('Please enter a Delivery Number');
      return;
    }

    const newNote = {
      id: Date.now(),
      owner: addNoteForm.owner || 'shemin',
      number: addNoteForm.deliveryNumber.trim() || `CTDN#${1094 + deliveryNotes.length}`,
      date: addNoteForm.date || '16-11-2026',
      customer: addNoteForm.receivedBy || (customers[0]?.name || 'Commercial Client'),
      order: addNoteForm.orderNumber || addNoteForm.order || 'SO-2026-4402',
      invoice: addNoteForm.invoice || 'INV-2026-0891',
      type: addNoteForm.type,
      location: addNoteForm.location
        ? `${addNoteForm.location}, ${addNoteForm.stateRegion}`
        : `${addNoteForm.stateRegion}, UAE`,
      receivedBy: addNoteForm.receivedBy || 'Site Engineer',
      rawCost: 3500,
      cost: 'AED 3,500',
      costUpdate: addNoteForm.updateMaterialCost ? 'Updated' : 'Pending',
      status: 'Delivered',
      items: [
        { name: addNoteForm.orderName || 'Commercial Equipment & Parts', qty: 1, unit: 'Lot' }
      ],
      gatePassNo: `GP-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleNo: 'AUH-B-77419',
      driverName: 'Muhammad Siddique'
    };

    setDeliveryNotes([newNote, ...deliveryNotes]);
    toast.success(`Delivery Note "${newNote.number}" created successfully!`);
    setIsAddModalOpen(false);

    // Bump sequence for next time
    setAddNoteForm((prev) => ({
      ...prev,
      deliveryNumber: `CTDN#${1095 + deliveryNotes.length}`,
      orderName: '',
      orderNumber: '',
      receivedBy: '',
      location: '',
      contactNumber: '',
      reference: '',
      remarks: '',
      lpo: '',
      lpoDate: ''
    }));
  };

  const handleDeleteNote = (id) => {
    setDeliveryNotes(deliveryNotes.filter((n) => n.id !== id));
    toast.success('Delivery Note deleted');
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* 1. FILTER CARD (Matching Reference Image Layout)               */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        {/* Row 1: Select Owner | Order | Invoice | Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Owner */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Select Owner</label>
            <div className="relative">
              <select
                value={filterOwner}
                onChange={(e) => {
                  setFilterOwner(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
              >
                <option value="All Owners">All Owners</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Order */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Order</label>
            <div className="relative">
              <select
                value={filterOrder}
                onChange={(e) => {
                  setFilterOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
              >
                <option value="Select Order">Select Order</option>
                <option value="SO-2026-4402">SO-2026-4402</option>
                <option value="SO-2026-4401">SO-2026-4401</option>
                <option value="SO-2026-4390">SO-2026-4390</option>
                <option value="SO-2026-4385">SO-2026-4385</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Invoice */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Invoice</label>
            <div className="relative">
              <select
                value={filterInvoice}
                onChange={(e) => {
                  setFilterInvoice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
              >
                <option value="Select Invoice">Select Invoice</option>
                <option value="INV-2026-0891">INV-2026-0891</option>
                <option value="INV-2026-0888">INV-2026-0888</option>
                <option value="INV-2026-0844">INV-2026-0844</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Cost Update */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Cost Update</label>
            <div className="relative">
              <select
                value={filterCostUpdate}
                onChange={(e) => {
                  setFilterCostUpdate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
              >
                <option value="All">All</option>
                <option value="Updated">Updated</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Reset Action */}
        <div className="flex justify-end pt-1">
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

      {/* ============================================================== */}
      {/* 2. TABLE CONTAINER (Header + Shows + Rows + Columns)           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Top Header: Title & + DELIVERY NOTE Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Delivery Note</h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ DELIVERY NOTE</span>
          </button>
        </div>

        {/* Sub-bar: Shows [ 10 ▾ ] Rows & Search Delivery Note */}
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
              placeholder="Search Delivery Note"
              className="w-full h-9 pl-3.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Table View (Matching Image 1 Columns: SL.No, Owner, Number, Date, Customer, Order, Cost, Actions) */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-14">SL.No</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-slate-400 font-medium text-xs">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FileText className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                      <span className="font-bold text-slate-600">No delivery notes found.</span>
                      <span className="text-[11px] text-slate-400">Click '+ DELIVERY NOTE' above to issue a dispatch slip.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRows.map((note, index) => (
                  <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {String(startIndex + index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{note.owner}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600 text-xs">{note.number}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {note.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 max-w-[150px] truncate block" title={note.customer}>
                        {note.customer}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{note.order}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">Main Warehouse</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-xs">{note.cost}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {note.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedNoteDetail(note)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(`Printing Delivery Note ${note.number}...`)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Print Note"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
              &laquo;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#00875A] text-white shadow-xs'
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
              &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL: ADD DELIVERY NOTE (Matching Reference Image 1)       */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-[680px] w-full p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[96vh] flex flex-col">
            {/* Modal Header: Add Delivery Note | X */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 shrink-0">
              <h3 className="font-bold text-sm text-slate-900">
                Add Delivery Note
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDeliveryNoteSubmit} className="flex-1 overflow-y-auto pr-1 space-y-3">
              {/* 2-Column Responsive Layout (Matching Image 1 Exactly) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                {/* ============ LEFT COLUMN ============ */}
                <div className="space-y-2">
                  {/* 1. Owner */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Owner
                    </label>
                    <div className="relative">
                      <User className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={addNoteForm.owner}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, owner: e.target.value })}
                        className="w-full pl-7 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="shemin">shemin</option>
                        {ownerOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 2. Type * */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={addNoteForm.type}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, type: e.target.value })}
                        className="w-full px-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="Customer Delivery Note">Customer Delivery Note</option>
                        <option value="Internal Transfer">Internal Transfer</option>
                        <option value="Return to Vendor">Return to Vendor</option>
                        <option value="Sample Dispatch">Sample Dispatch</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 3. Delivery# * */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Delivery# <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={addNoteForm.deliveryNumber}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, deliveryNumber: e.target.value })}
                        className="flex-1 px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <button
                        type="button"
                        onClick={() => toast.info('Delivery Note sequence CTDN# active')}
                        className="px-2 h-[30px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 text-[#0284C7] cursor-pointer"
                        title="Sequence Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Date */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addNoteForm.date}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, date: e.target.value })}
                        placeholder="16-11-2026"
                        className="w-full pl-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 5. Order * */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Order <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={addNoteForm.order}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddNoteForm({
                            ...addNoteForm,
                            order: val,
                            orderNumber: val,
                            orderName: val ? `${val} Commercial Delivery` : ''
                          });
                        }}
                        className="w-full px-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="">Select Order</option>
                        <option value="SO-2026-4402">SO-2026-4402 - Commercial Port Cold Storage</option>
                        <option value="SO-2026-4401">SO-2026-4401 - Emirates Steel Project</option>
                        <option value="SO-2026-4390">SO-2026-4390 - SAIF Server Room Chillers</option>
                        <option value="CTSO#3954">CTSO#3954 - JAFZA Cold Chain Logistics</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 6. Order Name & No. (Two inputs side-by-side) */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Order Name & No.
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Order Name"
                        value={addNoteForm.orderName}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, orderName: e.target.value })}
                        className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <input
                        type="text"
                        placeholder="Order Number"
                        value={addNoteForm.orderNumber}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, orderNumber: e.target.value })}
                        className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                    </div>
                  </div>

                  {/* 7. Store * */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Store <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={addNoteForm.store}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, store: e.target.value })}
                        className="w-full px-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="Main Warehouse - Mussafah">Main Warehouse - Mussafah</option>
                        <option value="JAFZA Central Store">JAFZA Central Store</option>
                        <option value="Sharjah Industrial Store">Sharjah Industrial Store</option>
                        <option value="Al Quoz Depot">Al Quoz Depot</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 8. Invoice */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Invoice
                    </label>
                    <div className="relative">
                      <select
                        value={addNoteForm.invoice}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, invoice: e.target.value })}
                        className="w-full px-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="">Select Invoice</option>
                        <option value="INV-2026-0891">INV-2026-0891</option>
                        <option value="INV-2026-0888">INV-2026-0888</option>
                        <option value="INV-2026-0844">INV-2026-0844</option>
                        <option value="CTINV#15259">CTINV#15259</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 9. LPO */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      LPO
                    </label>
                    <input
                      type="text"
                      placeholder="LPO"
                      value={addNoteForm.lpo}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, lpo: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 10. LPO Date */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      LPO Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={addNoteForm.lpoDate}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, lpoDate: e.target.value })}
                        className="w-full pl-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* ============ RIGHT COLUMN ============ */}
                <div className="space-y-2">
                  {/* 1. Approved By */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={addNoteForm.approvedBy}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, approvedBy: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 2. Approved Contact Number */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Approved Contact Number
                    </label>
                    <input
                      type="text"
                      value={addNoteForm.approvedContactNumber}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, approvedContactNumber: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 3. Received By */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Received By
                    </label>
                    <input
                      type="text"
                      placeholder="Received By"
                      value={addNoteForm.receivedBy}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, receivedBy: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 4. Location */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Location
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Location"
                      value={addNoteForm.location}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, location: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none h-[42px]"
                    />
                  </div>

                  {/* 5. State/Region */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      State/Region
                    </label>
                    <div className="relative">
                      <select
                        value={addNoteForm.stateRegion}
                        onChange={(e) => setAddNoteForm({ ...addNoteForm, stateRegion: e.target.value })}
                        className="w-full px-2.5 pr-7 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                      >
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Umm Al-Quwain">Umm Al-Quwain</option>
                        <option value="Ras Al-Khaimah">Ras Al-Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 6. Contact Number */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      placeholder="Contact Number"
                      value={addNoteForm.contactNumber}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, contactNumber: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 7. Reference */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Reference
                    </label>
                    <input
                      type="text"
                      placeholder="Reference"
                      value={addNoteForm.reference}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, reference: e.target.value })}
                      className="w-full px-2.5 h-[30px] bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>

                  {/* 8. Remarks */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Remarks
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Remarks"
                      value={addNoteForm.remarks}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, remarks: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none h-[50px]"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row: Checkbox on Left | [Close] [Submit] on Right */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addNoteForm.updateMaterialCost}
                    onChange={(e) => setAddNoteForm({ ...addNoteForm, updateMaterialCost: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-rose-600 accent-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-rose-600">
                    Update material cost to order
                  </span>
                </label>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition text-xs cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-md bg-[#139a9c] hover:bg-[#0e7490] text-white font-semibold transition text-xs cursor-pointer shadow-xs"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW DELIVERY NOTE DETAIL ================= */}
      {selectedNoteDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedNoteDetail.number}
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Dispatch Acknowledgement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoteDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Consignee:</span>
                  <span className="font-bold text-slate-800">{selectedNoteDetail.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Associated Order:</span>
                  <span className="font-mono text-slate-700">{selectedNoteDetail.order}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Reference:</span>
                  <span className="font-mono text-blue-600">{selectedNoteDetail.invoice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Site:</span>
                  <span className="text-slate-700 max-w-[220px] text-right">{selectedNoteDetail.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Received By:</span>
                  <span className="font-semibold text-slate-800">{selectedNoteDetail.receivedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Date:</span>
                  <span className="font-mono text-slate-700">{selectedNoteDetail.date}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block">Dispatched Line Items:</span>
                <div className="space-y-1">
                  {selectedNoteDetail.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      <span>{it.name}</span>
                      <span className="font-mono font-bold text-slate-800">{it.qty} {it.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setSelectedNoteDetail(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Delivery Note ${selectedNoteDetail.number} confirmed`);
                  setSelectedNoteDetail(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
