import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  RotateCw,
  UploadCloud,
  Plus,
  Settings,
  ChevronDown,
  Eye,
  Edit3,
  Trash2,
  X,
  Calendar,
  Clock,
  Info,
  ArrowLeft,
  ThumbsUp,
  FileText,
  Printer,
  CheckCircle,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

export default function SalesOrderView({
  employees = [],
  customers = [],
  opportunities = [],
  leads = []
}) {
  // Mode: 'list' (Matching Reference Image 2) | 'create' (Matching Reference Image 3)
  const [viewMode, setViewMode] = useState('list');

  // Top category tab (Image 2)
  const [activeCategory, setActiveCategory] = useState('All');
  // 'All' | 'Fit Out' | 'Supply' | 'Installation' | 'Supply And Installation' | 'Spare Part Sales' | 'Projects' | 'Service - Under Warranty' | 'Service - On Call' | 'Other' | 'Overview'

  // Filter States (Image 2: 3 Rows)
  const [filterDateRange, setFilterDateRange] = useState('All Month & Year');
  const [filterOwner, setFilterOwner] = useState('All Owners');
  const [filterBizOpp, setFilterBizOpp] = useState('Select');
  const [filterCampaign, setFilterCampaign] = useState('Select Campaign');

  const [filterCustomer, setFilterCustomer] = useState('Select Customer');
  const [filterTags, setFilterTags] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('All');
  const [filterOrderType, setFilterOrderType] = useState('All');
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState('All');

  // Table Sub-controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);

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

  // Available options
  const ownerOptions = useMemo(() => {
    const names = [];
    availableUsers.forEach((u) => {
      if (u.name && !names.includes(u.name)) names.push(u.name);
    });
    return names.length > 0 ? names : ['Super Admin'];
  }, [availableUsers]);

  const oppOptions = useMemo(() => {
    const list = [
      'Cold Storage Expansion Phase 2',
      'Freezone Fleet Logistics Contract',
      'Commercial HVAC Retrofit',
      'Sharjah Industrial Port Upgrade',
      'Chemical Supply Contract 2027'
    ];
    opportunities.forEach((opp) => {
      const name = opp.name || opp.title;
      if (name && !list.includes(name)) list.push(name);
    });
    return list;
  }, [opportunities]);

  // Combined opportunities from props and localStorage
  const availableOpportunities = useMemo(() => {
    let savedList = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_opportunities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          savedList = parsed;
        }
      }
    } catch {}

    const map = new Map();
    // Default system opportunity matching CTEQ#7539 / TAP / SHAHEER
    map.set('CTEQ#7539', {
      id: 7539,
      code: 'CTEQ#7539',
      name: 'TAP',
      customer: 'SHAHEER',
      owner: 'MUHAMMED RISWAN',
      amount: 'AED 2,100.00',
      rawAmount: 2100.0,
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

    if (Array.isArray(opportunities)) {
      opportunities.forEach((o) => {
        const key = o.code || o.name || String(o.id);
        if (key) map.set(key, o);
      });
    }
    savedList.forEach((po) => {
      const key = po.code || po.name || String(po.id);
      if (key) map.set(key, po);
    });

    return Array.from(map.values());
  }, [opportunities]);

  // Live Sales Order Data Store (Safely initialized, preserving existing data)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem('alzaydan_crm_orders', JSON.stringify(orders));
      } catch {}
    }
  }, [orders]);

  const [availableQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_quotations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const availableLeads = useMemo(() => {
    let list = Array.isArray(leads) ? [...leads] : [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((pl) => {
            if (!list.some((l) => (l.leadCode && l.leadCode === pl.leadCode) || (l.id && l.id === pl.id))) {
              list.push(pl);
            }
          });
        }
      }
    } catch {}
    return list;
  }, [leads]);

  const handleCommercialOfferSelect = (offerNo) => {
    if (!offerNo || offerNo === 'None (Direct Order)') {
      setAddOrderForm((prev) => ({ ...prev, commercialOfferNumber: offerNo }));
      return;
    }
    const matched = availableQuotations.find((q) => (q.quotationNo && q.quotationNo === offerNo) || (q.quotationNumber && q.quotationNumber === offerNo));
    if (matched) {
      const rawNum = matched.rawAmount ? String(matched.rawAmount) : (matched.amount ? String(parseFloat(String(matched.amount).replace(/[^0-9.]/g, '')) || '0.00') : '0.00');
      setAddOrderForm((prev) => ({
        ...prev,
        commercialOfferNumber: matched.quotationNo || matched.quotationNumber || offerNo,
        customerName: matched.customer || prev.customerName,
        amount: rawNum,
        orderTitle: prev.orderTitle || `Order for ${matched.customer || 'Commercial Client'}`,
        businessOpportunity: matched.bizOpp || prev.businessOpportunity,
        orderOwner: matched.owner || prev.orderOwner
      }));
      toast.success(`Auto-filled details from Quotation ${matched.quotationNo || offerNo}!`);
    } else {
      setAddOrderForm((prev) => ({ ...prev, commercialOfferNumber: offerNo }));
    }
  };

  const handleLeadSelectInOrder = (leadCodeVal) => {
    if (!leadCodeVal) {
      setAddOrderForm((prev) => ({ ...prev, leadNumber: '' }));
      return;
    }
    const matchedLead = availableLeads.find((l) => l.leadCode === leadCodeVal || String(l.id) === leadCodeVal);
    if (matchedLead) {
      const companyOrCust = matchedLead.customerName || matchedLead.company || matchedLead.name || '';
      const personName = matchedLead.contactName || matchedLead.name || '';
      setAddOrderForm((prev) => ({
        ...prev,
        leadNumber: matchedLead.leadCode || leadCodeVal,
        customerName: companyOrCust || prev.customerName,
        pointOfContact: personName || prev.pointOfContact,
        contactPerson: personName || prev.contactPerson,
        location: matchedLead.location || prev.location
      }));
      toast.success(`Auto-filled details from Lead ${matchedLead.leadCode}!`);
    } else {
      setAddOrderForm((prev) => ({ ...prev, leadNumber: leadCodeVal }));
    }
  };

  // Full Add Order Form State (Matching Reference Image 3 with user adjustments)
  const [addOrderForm, setAddOrderForm] = useState({
    // Left column
    customerName: '',
    orderTitle: '',
    source: '',
    orderDate: '16-11-2026',
    orderTime: '01:01 PM',
    amount: '0.00',
    vatType: 'With VAT',
    adjustment: '0.00',
    orderTags: '',
    businessOpportunity: '',
    lpoNumber: '',
    location: '',
    type: '',
    deliveryMethod: '',
    contactPerson: '',

    // Right column
    orderOwner: 'shemin',
    pointOfContact: '',
    sourceName: '',
    orderNumber: 'CTSO#3954',
    commercialOfferNumber: 'None (Direct Order)',
    leadNumber: '',
    discount: '0.00',
    vatRate: '5',
    campaign: '',
    deliveryDate: '',
    lpoDate: '',
    comments: '', // Changed from Product Details to Comments as requested
    orderStatus: 'Pending',
    reference: ''
  });

  // Dynamic VAT and Total Calculations for Image 3
  const calculatedVatAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addOrderForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addOrderForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    if (addOrderForm.vatType === 'With VAT') {
      const rate = parseFloat(addOrderForm.vatRate) || 0;
      return (net * rate) / 100;
    }
    return 0;
  }, [addOrderForm.amount, addOrderForm.discount, addOrderForm.vatRate, addOrderForm.vatType]);

  const calculatedTotalAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addOrderForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addOrderForm.discount).replace(/,/g, '')) || 0;
    const adj = parseFloat(String(addOrderForm.adjustment).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    return net + calculatedVatAmount + adj;
  }, [addOrderForm.amount, addOrderForm.discount, addOrderForm.adjustment, calculatedVatAmount]);

  // Reset Filters
  const handleResetFilters = () => {
    setFilterDateRange('All Month & Year');
    setFilterOwner('All Owners');
    setFilterBizOpp('Select');
    setFilterCampaign('Select Campaign');
    setFilterCustomer('Select Customer');
    setFilterTags('');
    setFilterOrderStatus('All');
    setFilterOrderType('All');
    setFilterInvoiceStatus('All');
    setSearchQuery('');
    toast.info('Order filters reset to default');
  };

  // Filtered Orders
  const filteredList = useMemo(() => {
    return orders.filter((item) => {
      // Category pill filter
      if (activeCategory !== 'All' && activeCategory !== 'Overview' && item.category !== activeCategory) {
        return false;
      }

      if (filterOwner !== 'All Owners' && item.owner !== filterOwner) return false;
      if (filterCustomer !== 'Select Customer' && item.customer !== filterCustomer) return false;
      if (filterOrderStatus !== 'All' && item.orderStatus !== filterOrderStatus) return false;
      if (filterInvoiceStatus !== 'All' && item.invoiceStatus !== filterInvoiceStatus) return false;
      if (filterOrderType !== 'All' && item.category !== filterOrderType) return false;
      if (filterBizOpp !== 'Select' && item.bizOpp !== filterBizOpp) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (item.orderNo || '').toLowerCase().includes(q);
        const matchCust = (item.customer || '').toLowerCase().includes(q);
        const matchDetails = (item.details || '').toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchDetails && !matchOwner) return false;
      }

      return true;
    });
  }, [
    orders,
    activeCategory,
    filterOwner,
    filterCustomer,
    filterOrderStatus,
    filterInvoiceStatus,
    filterOrderType,
    filterBizOpp,
    searchQuery
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  // Action Handlers
  const handleOpenView = (item) => {
    setSelectedOrderDetail(item);
    setViewMode('view');
    setActiveActionId(null);
  };

  const handleCloseView = () => {
    setSelectedOrderDetail(null);
    setViewMode('list');
  };

  // Dynamic products resolution for the Sales Order View
  const currentOrderProducts = useMemo(() => {
    if (selectedOrderDetail?.products && Array.isArray(selectedOrderDetail.products) && selectedOrderDetail.products.length > 0) {
      return selectedOrderDetail.products;
    }
    const matchedOpp = availableOpportunities.find(
      (o) =>
        o.code === selectedOrderDetail?.businessOpportunity ||
        o.name === selectedOrderDetail?.businessOpportunity ||
        (selectedOrderDetail?.customer && o.customer && o.customer.toLowerCase() === selectedOrderDetail.customer.toLowerCase())
    );
    if (matchedOpp?.products && Array.isArray(matchedOpp.products) && matchedOpp.products.length > 0) {
      return matchedOpp.products;
    }
    const rawNum =
      parseFloat(String(selectedOrderDetail?.rawAmount ?? selectedOrderDetail?.amount ?? 2000).replace(/[^0-9.]/g, '')) || 2000;
    return [
      {
        id: 1,
        itemName: selectedOrderDetail?.orderTitle || 'tap',
        itemCode: 'sk1786',
        brand: 'lk',
        quantity: 1,
        price: rawNum,
        total: rawNum
      }
    ];
  }, [selectedOrderDetail, availableOpportunities]);

  const orderProductsCalculated = useMemo(() => {
    let sub = 0;
    currentOrderProducts.forEach((p) => {
      const lineTot = parseFloat(String(p.total ?? (p.quantity * p.price || 0)).replace(/,/g, '')) || 0;
      sub += lineTot;
    });
    if (sub === 0 && selectedOrderDetail) {
      sub = parseFloat(String(selectedOrderDetail.rawAmount ?? selectedOrderDetail.amount ?? 2000).replace(/[^0-9.]/g, '')) || 2000;
    }
    const vat = (sub * 5) / 100;
    const tot = sub + vat;
    return { sub, vat, tot };
  }, [currentOrderProducts, selectedOrderDetail]);

  const handleOpenAddOrder = () => {
    setSelectedOrderDetail(null);
    setEditingOrderId(null);
    setAddOrderForm((prev) => ({
      ...prev,
      orderNumber: `CTSO#${3954 + orders.length}`,
      orderTitle: '',
      customerName: 'Select Customer',
      amount: '0.00',
      discount: '0.00',
      adjustment: '0.00',
      comments: '',
      orderTags: '',
      lpoNumber: '',
      reference: ''
    }));
    setViewMode('create');
  };

  const handleOpenEdit = (item) => {
    setActiveActionId(null);
    setSelectedOrderDetail(null);
    setEditingOrderId(item.id);
    const cleanAmt = parseFloat(String(item.rawAmount ?? item.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanVat = parseFloat(String(item.vat || '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanDiscount = parseFloat(String(item.discount || '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanAdj = parseFloat(String(item.adjustment || '0').replace(/[^0-9.]/g, '')) || 0;
    let rate = '5';
    if (cleanAmt > 0 && cleanVat > 0) {
      rate = String(Math.round((cleanVat / cleanAmt) * 100));
    }

    setAddOrderForm({
      orderTitle: item.details || '',
      opportunity: item.opportunity || '',
      customerName: item.customer || 'Select Customer',
      currency: 'AED',
      amount: cleanAmt > 0 ? String(cleanAmt) : '0.00',
      vatType: cleanVat > 0 ? 'With VAT' : 'Without VAT',
      adjustment: cleanAdj > 0 ? String(cleanAdj) : '0.00',
      orderDate: item.orderDate || '16-11-2026',
      orderTags: item.orderTags || '',
      businessOpportunity: item.bizOpp || '',
      lpoNumber: item.lpoNumber || '',
      location: item.location || '',
      type: item.category || '',
      deliveryMethod: item.deliveryMethod || '',
      contactPerson: item.contactPerson || '',
      orderOwner: item.owner || 'shemin',
      pointOfContact: item.pointOfContact || '',
      sourceName: item.sourceName || '',
      orderNumber: item.orderNo || '',
      commercialOfferNumber: item.commercialOfferNumber || 'None (Direct Order)',
      leadNumber: item.leadNumber || '',
      discount: cleanDiscount > 0 ? String(cleanDiscount) : '0.00',
      vatRate: rate,
      campaign: item.campaign || '',
      deliveryDate: item.deliveryDate || '',
      lpoDate: item.lpoDate || '',
      comments: item.comments || '',
      orderStatus: item.orderStatus || 'Pending',
      reference: item.reference || ''
    });
    setViewMode('create');
  };

  // Handle Add / Edit Order Submit (Image 3)
  const handleAddOrderSubmit = (e) => {
    e.preventDefault();
    if (!addOrderForm.customerName || addOrderForm.customerName === 'Select Customer') {
      toast.error('Please select a Customer Name');
      return;
    }
    if (!addOrderForm.orderTitle.trim()) {
      toast.error('Please enter an Order Title');
      return;
    }

    const rawAmt = parseFloat(String(addOrderForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addOrderForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    const vatVal = addOrderForm.vatType === 'With VAT' ? (net * (parseFloat(addOrderForm.vatRate) || 0)) / 100 : 0;
    const adj = parseFloat(String(addOrderForm.adjustment).replace(/,/g, '')) || 0;
    const totalVal = net + vatVal + adj;

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrderId
            ? {
                ...o,
                orderNo: addOrderForm.orderNumber.trim() || o.orderNo,
                owner: addOrderForm.orderOwner || o.owner,
                orderDate: addOrderForm.orderDate || o.orderDate,
                details: addOrderForm.orderTitle.trim(),
                customer: addOrderForm.customerName,
                category: addOrderForm.type || o.category,
                orderStatus: addOrderForm.orderStatus || o.orderStatus,
                rawAmount: rawAmt,
                amount: `AED ${rawAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                vat: `AED ${vatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                total: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                receivable: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                campaign: addOrderForm.campaign || o.campaign,
                bizOpp: addOrderForm.businessOpportunity || o.bizOpp,
                comments: addOrderForm.comments
              }
            : o
        )
      );
      toast.success(`Sales Order "${addOrderForm.orderNumber.trim()}" updated successfully!`);
      setEditingOrderId(null);
      setViewMode('list');
      return;
    }

    const newOrder = {
      id: Date.now(),
      orderNo: addOrderForm.orderNumber.trim() || `CTSO#${3954 + orders.length}`,
      owner: addOrderForm.orderOwner || 'shemin',
      ownerAvatarBg: 'bg-[#011635] text-white',
      orderDate: addOrderForm.orderDate || '16-11-2026',
      details: addOrderForm.orderTitle.trim(),
      customer: addOrderForm.customerName,
      category: addOrderForm.type || 'Supply And Installation',
      orderStatus: addOrderForm.orderStatus || 'Pending',
      rawAmount: rawAmt,
      amount: `AED ${rawAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      vat: `AED ${vatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      total: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      receivable: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      invoiceStatus: 'Not Invoiced',
      campaign: addOrderForm.campaign || 'Direct',
      bizOpp: addOrderForm.businessOpportunity || 'New Business',
      comments: addOrderForm.comments
    };

    setOrders((prev) => [newOrder, ...prev]);
    toast.success(`Sales Order "${newOrder.orderNo}" created successfully!`);
    setViewMode('list');

    // Reset and bump sequence
    setAddOrderForm((prev) => ({
      ...prev,
      orderNumber: `CTSO#${3955 + orders.length}`,
      orderTitle: '',
      amount: '0.00',
      discount: '0.00',
      adjustment: '0.00',
      comments: '',
      orderTags: '',
      lpoNumber: '',
      reference: ''
    }));
  };

  const handleDelete = (id, no) => {
    setOrders((prev) => prev.filter((i) => i.id !== id));
    if (selectedOrderDetail && selectedOrderDetail.id === id) {
      setSelectedOrderDetail(null);
      setViewMode('list');
    }
    toast.success(`Sales order ${no} deleted.`);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TIER: VIEW ORDER (Full Page View)                              */}
      {/* ============================================================== */}
      {viewMode === 'view' && selectedOrderDetail && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden animate-in fade-in duration-150 space-y-0">
          {/* Header Bar: Timestamp | Red [X] */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tracking-wide">
              <ShoppingCart className="w-4 h-4 text-slate-500" />
              <span className="uppercase text-[11px] font-mono text-slate-600">
                ORDER CREATED BY {selectedOrderDetail.owner || 'SHEMIN'} ON {selectedOrderDetail.orderDate || '16-11-2026'} | ORDER LAST MODIFIED BY {selectedOrderDetail.owner || 'SHEMIN'} ON {selectedOrderDetail.orderDate || '16-11-2026'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseView}
              className="w-6 h-6 rounded bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition shadow-xs"
              title="Close and return to list"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Top 2-Column: Order Details & Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Order Details */}
              <div className="lg:col-span-6 bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-2 border-b border-slate-200/60">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <span>Order Details</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Order Owner</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#011635] text-white text-[10px] font-bold flex items-center justify-center">
                        {(selectedOrderDetail.owner || 'S')[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 uppercase">{selectedOrderDetail.owner || 'SHEMIN'}</span>
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Order Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrderDetail.orderNo || 'CTSO#3954'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Order Type</span>
                    <span className="text-slate-800 font-medium">{selectedOrderDetail.category || 'Supply And Installation'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Order Date</span>
                    <span className="font-mono text-slate-700">{selectedOrderDetail.orderDate || '16-11-2026'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Opportunity</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600">{selectedOrderDetail.opportunity || selectedOrderDetail.bizOpp || 'Tap'}</span>
                      <Info className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Customer Name</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600">{selectedOrderDetail.customer || 'Shaheer'}</span>
                      <Info className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Prepared By</span>
                    <span className="font-medium text-slate-800">{selectedOrderDetail.owner || 'SHEMIN'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Prepared By Mobile</span>
                    <span className="font-mono text-slate-700">+971585262058</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Prepared By Email</span>
                    <span className="text-slate-700">shemin@alzaydanfze.com</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Prepared By Designation</span>
                    <span className="text-slate-700">Sales Executive</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Attention</span>
                    <span className="font-semibold text-slate-800">{selectedOrderDetail.contactPerson || 'Mr. shemeem'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Mobile</span>
                    <span className="font-mono text-slate-700">+971 567890987</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedOrderDetail.orderStatus === 'Approved'
                          ? 'bg-[#00A389] text-white'
                          : selectedOrderDetail.orderStatus === 'In Progress'
                          ? 'bg-blue-600 text-white'
                          : selectedOrderDetail.orderStatus === 'Delivered'
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {selectedOrderDetail.orderStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Submitted For Approval</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {(selectedOrderDetail.owner || 'SHEMIN').toUpperCase()} ON MON {selectedOrderDetail.orderDate || '18-11-2026'} 5:45:13 PM
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Approved</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {selectedOrderDetail.orderStatus === 'Approved'
                        ? `${(selectedOrderDetail.owner || 'SHEMIN').toUpperCase()} ON MON ${selectedOrderDetail.orderDate || '18-11-2026'} 5:45:17 PM`
                        : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Overview Metric Cards (Simple & Clean: Actual Price | VAT | Total Order Value) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="font-bold text-slate-800 text-xs pb-1 flex items-center justify-between">
                  <span>Overview</span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">5% UAE VAT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* ACTUAL PRICE */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">ACTUAL PRICE</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
                        AED {orderProductsCalculated.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      AED
                    </div>
                  </div>

                  {/* VAT (5%) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">VAT (5%)</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
                        AED {orderProductsCalculated.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                  </div>

                  {/* TOTAL AMOUNT */}
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-700">TOTAL ORDER VALUE</div>
                      <div className="text-sm font-extrabold text-blue-700 mt-1 font-mono">
                        AED {orderProductsCalculated.tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      $
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Scope / Details & Comments (if provided) */}
            {(selectedOrderDetail.details || selectedOrderDetail.comments) && (
              <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                {selectedOrderDetail.details && (
                  <div>
                    <div className="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <span>Order Scope &amp; Details</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/70 font-medium">
                      {selectedOrderDetail.details}
                    </p>
                  </div>
                )}
                {selectedOrderDetail.comments && (
                  <div>
                    <div className="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Comments</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/70 italic">
                      {selectedOrderDetail.comments}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Products / Items Details (Inherited from Opportunity) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Products / Items Details</span>
                  {selectedOrderDetail.businessOpportunity && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedOrderDetail.businessOpportunity}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentOrderProducts.length} {currentOrderProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3 text-center">QTY</th>
                      <th className="py-2.5 px-3 text-right">Unit Price (AED)</th>
                      <th className="py-2.5 px-3 text-right">Total (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentOrderProducts.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.itemName || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{p.itemCode || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.brand || '—'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{p.quantity || 1}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {(parseFloat(p.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          {(parseFloat(p.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-xs">
                      <td colSpan={5} className="py-2.5 px-3 text-right text-slate-600">
                        Subtotal:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                        AED {orderProductsCalculated.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold text-xs">
                      <td colSpan={5} className="py-2 px-3 text-right text-slate-500 font-medium">
                        5% UAE VAT:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        AED {orderProductsCalculated.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/60 font-extrabold text-xs text-blue-900 border-t border-blue-100">
                      <td colSpan={5} className="py-2.5 px-3 text-right text-blue-900">
                        Total Order Value:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-700 text-sm">
                        AED {orderProductsCalculated.tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bottom Action Buttons: Back on left, Print/Approve/Edit/Delete on right */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseView}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast.info('Print format selected')}
                  className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Format ▾</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Exporting USD Sales Order...')}
                  className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print in USD</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(`Printing order ${selectedOrderDetail.orderNo}...`)}
                  className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                {selectedOrderDetail.orderStatus !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === selectedOrderDetail.id ? { ...o, orderStatus: 'Approved' } : o
                        )
                      );
                      setSelectedOrderDetail((prev) => (prev ? { ...prev, orderStatus: 'Approved' } : prev));
                      toast.success(`Sales Order "${selectedOrderDetail.orderNo}" approved successfully!`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#00A389] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Order</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = selectedOrderDetail;
                    handleCloseView();
                    handleOpenEdit(itemToEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1D68F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(selectedOrderDetail.id, selectedOrderDetail.orderNo);
                    handleCloseView();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER 1: ADD ORDER VIEW (Matching Reference Image 3 with edits) */}
      {/* ============================================================== */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Card Header: 👍 Add Order | [+ Customer] [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ThumbsUp className="w-4 h-4 text-slate-600" />
              <span>{editingOrderId ? 'Edit Order' : 'Add Order'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.info('Quick Add Customer modal opened')}
                className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingOrderId(null);
                  setViewMode('list');
                }}
                className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Close and return to orders list"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          <form onSubmit={handleAddOrderSubmit} className="space-y-6 text-xs">
            {/* 2-Column Responsive Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Customer Name * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info('Add New Customer shortcut')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    required
                    value={addOrderForm.customerName}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Order Title * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter order title..."
                    value={addOrderForm.orderTitle}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, orderTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 3. Source (?) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <label className="text-xs font-semibold text-slate-700">Source</label>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info('Add New Source')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOrderForm.source}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, source: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Source</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Tender / RFP">Tender / RFP</option>
                    <option value="LinkedIn Campaign">LinkedIn Campaign</option>
                  </select>
                </div>

                {/* 4. Order Date * (Date & Time Side-by-Side) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={addOrderForm.orderDate}
                        onChange={(e) => setAddOrderForm({ ...addOrderForm, orderDate: e.target.value })}
                        placeholder="16-11-2026"
                        className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={addOrderForm.orderTime}
                        onChange={(e) => setAddOrderForm({ ...addOrderForm, orderTime: e.target.value })}
                        placeholder="01:01 PM"
                        className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 5. Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addOrderForm.amount}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 6. VAT Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT Type
                  </label>
                  <select
                    value={addOrderForm.vatType}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, vatType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="With VAT">With VAT</option>
                    <option value="Without VAT">Without VAT</option>
                  </select>
                </div>

                {/* 7. Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adjustment
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addOrderForm.adjustment}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, adjustment: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 8. Order Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Keywords attached to the order"
                    value={addOrderForm.orderTags}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, orderTags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 9. Business Opportunity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Business Opportunity
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info('Add New Business Opportunity')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOrderForm.businessOpportunity}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, businessOpportunity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Business Opportunity</option>
                    <option value="Supply And Installation">Supply And Installation</option>
                    <option value="Commercial HVAC Retrofit">Commercial HVAC Retrofit</option>
                    <option value="Cold Storage Installation">Cold Storage Installation</option>
                    {oppOptions.map((opp) => (
                      <option key={opp} value={opp}>
                        {opp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 10. LPO Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter LPO Number"
                    value={addOrderForm.lpoNumber}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, lpoNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 11. Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search location"
                      value={addOrderForm.location}
                      onChange={(e) => setAddOrderForm({ ...addOrderForm, location: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 12. Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={addOrderForm.type}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Type</option>
                    <option value="Fit Out">Fit Out</option>
                    <option value="Supply">Supply</option>
                    <option value="Installation">Installation</option>
                    <option value="Supply And Installation">Supply And Installation</option>
                    <option value="Spare Part Sales">Spare Part Sales</option>
                    <option value="Projects">Projects</option>
                    <option value="Service - Under Warranty">Service - Under Warranty</option>
                    <option value="Service - On Call">Service - On Call</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* 13. Delivery Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Delivery Method
                  </label>
                  <input
                    type="text"
                    placeholder="Enter delivery method (e.g. Site Delivery UAE)"
                    value={addOrderForm.deliveryMethod}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, deliveryMethod: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 14. Contact Person */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Enter contact person name"
                    value={addOrderForm.contactPerson}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Order Owner * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Order Owner <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info('Add New Owner')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOrderForm.orderOwner}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, orderOwner: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="shemin">shemin</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Point of Contact */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Point of Contact
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info('Add Contact Person')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOrderForm.pointOfContact}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, pointOfContact: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="Select Customer First">Select Customer First</option>
                    <option value="Eng. Manaf Tariq">Eng. Manaf Tariq</option>
                    <option value="Rashid Al Nuaimi">Rashid Al Nuaimi</option>
                    <option value="Mustafa Shemin">Mustafa Shemin</option>
                  </select>
                </div>

                {/* 3. Source Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={addOrderForm.sourceName}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, sourceName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 4. Order Number * & Commercial Offer Number (Side-by-Side as in Image 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Order Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={addOrderForm.orderNumber}
                        onChange={(e) => setAddOrderForm({ ...addOrderForm, orderNumber: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                      />
                      <button
                        type="button"
                        onClick={() => toast.info('Sales Order sequence: CTSO# active')}
                        className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-[#0284C7] cursor-pointer"
                        title="Sequence Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 truncate">
                        Commercial Offer Number
                      </label>
                      <button
                        type="button"
                        onClick={() => toast.info('Add Commercial Offer link')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer shrink-0"
                      >
                        + New
                      </button>
                    </div>
                    <select
                      value={addOrderForm.commercialOfferNumber}
                      onChange={(e) => handleCommercialOfferSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="None (Direct Order)">None (Direct Order)</option>
                      {availableQuotations.map((q) => (
                        <option key={`quot-opt-${q.id || q.quotationNo}`} value={q.quotationNo || q.quotationNumber}>
                          {q.quotationNo || q.quotationNumber} - {q.customer}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Lead Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Number
                  </label>
                  <select
                    value={addOrderForm.leadNumber}
                    onChange={(e) => handleLeadSelectInOrder(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Lead (Optional)</option>
                    {availableLeads.map((l) => (
                      <option key={`order-lead-${l.id || l.leadCode}`} value={l.leadCode}>
                        {l.leadCode} - {l.company || l.customerName || l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Discount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addOrderForm.discount}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, discount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 7. VAT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={addOrderForm.vatRate}
                        onChange={(e) => setAddOrderForm({ ...addOrderForm, vatRate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center outline-none focus:bg-white focus:border-[#011635]"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-600">
                      %
                    </div>
                    <div className="col-span-7">
                      <input
                        type="text"
                        readOnly
                        placeholder="0.00"
                        value={calculatedVatAmount > 0 ? calculatedVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        className="w-full px-3.5 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Total Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={calculatedTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    className="w-full px-3.5 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 outline-none cursor-not-allowed"
                  />
                </div>

                {/* 9. Campaign (?) */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Campaign</label>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <select
                    value={addOrderForm.campaign}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, campaign: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Campaign</option>
                    <option value="Direct Outreach">Direct Outreach</option>
                    <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                    <option value="JAFZA Trade Push">JAFZA Trade Push</option>
                  </select>
                </div>

                {/* 10. Delivery Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Delivery Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOrderForm.deliveryDate}
                      onChange={(e) => setAddOrderForm({ ...addOrderForm, deliveryDate: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 11. LPO Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOrderForm.lpoDate}
                      onChange={(e) => setAddOrderForm({ ...addOrderForm, lpoDate: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 12. Comments (Adjusted from Product Details per user request) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter order comments, commercial terms, or technical instructions..."
                    value={addOrderForm.comments}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none"
                  />
                </div>

                {/* 13. Order Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={addOrderForm.orderStatus}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, orderStatus: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* 14. Reference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference code or PO tender ref"
                    value={addOrderForm.reference}
                    onChange={(e) => setAddOrderForm({ ...addOrderForm, reference: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Row: [SUBMIT] and [← Back] (Order Form toggle removed per user instruction) */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs uppercase tracking-wider"
              >
                SUBMIT
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingOrderId(null);
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
      {/* TIER 2: SALES ORDER LIST VIEW (Matching Reference Image 2)     */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <>
          {/* ============================================================== */}
          {/* 1. TOP HORIZONTAL CATEGORY PILL RIBBON + UPLOAD ORDER BUTTON   */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'All', label: 'All' },
                { id: 'Fit Out', label: 'Fit Out' },
                { id: 'Supply', label: 'Supply' },
                { id: 'Installation', label: 'Installation' },
                { id: 'Supply And Installation', label: 'Supply And Installation' },
                { id: 'Spare Part Sales', label: 'Spare Part Sales' },
                { id: 'Projects', label: 'Projects' },
                { id: 'Service - Under Warranty', label: 'Service – Under Warranty' },
                { id: 'Service - On Call', label: 'Service – On Call' },
                { id: 'Other', label: 'Other' },
                { id: 'Overview', label: 'Overview' }
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                      isActive
                        ? 'border-b-2 border-red-500 text-slate-900 bg-slate-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Order</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. TOP FILTER CARD (Matching Image 2: 3 Rows)                  */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Row 1: Order Date | Order Owner | Business Opportunity | Campaign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Order Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    placeholder="All Month & Year"
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setFilterDateRange('All Month & Year')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Reset date"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Order Owner
                </label>
                <select
                  value={filterOwner}
                  onChange={(e) => { setFilterOwner(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All Owners">All Owners</option>
                  {ownerOptions.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Business Opportunity
                </label>
                <select
                  value={filterBizOpp}
                  onChange={(e) => { setFilterBizOpp(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select">Select</option>
                  <option value="New Business">New Business</option>
                  <option value="Expansion">Expansion</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Retrofit">Retrofit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Campaign
                </label>
                <select
                  value={filterCampaign}
                  onChange={(e) => { setFilterCampaign(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Campaign">Select Campaign</option>
                  <option value="Direct">Direct</option>
                  <option value="JAFZA Outreach">JAFZA Outreach</option>
                  <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                </select>
              </div>
            </div>

            {/* Row 2: Customer | Tags | Order Status | Order Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Customer
                </label>
                <select
                  value={filterCustomer}
                  onChange={(e) => { setFilterCustomer(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Customer">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Select tags"
                  value={filterTags}
                  onChange={(e) => setFilterTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Order Status
                </label>
                <select
                  value={filterOrderStatus}
                  onChange={(e) => { setFilterOrderStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Order Type
                </label>
                <select
                  value={filterOrderType}
                  onChange={(e) => { setFilterOrderType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Fit Out">Fit Out</option>
                  <option value="Supply">Supply</option>
                  <option value="Installation">Installation</option>
                  <option value="Supply And Installation">Supply And Installation</option>
                  <option value="Spare Part Sales">Spare Part Sales</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>
            </div>

            {/* Row 3: Invoice Status + Reset Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Invoice Status
                </label>
                <select
                  value={filterInvoiceStatus}
                  onChange={(e) => { setFilterInvoiceStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Not Invoiced">Not Invoiced</option>
                  <option value="Partially Invoiced">Partially Invoiced</option>
                  <option value="Fully Invoiced">Fully Invoiced</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer self-end sm:self-center"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. TABLE CONTAINER (Matching Image 2: 🛒 Order + Shows + Rows) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Action Header: 🛒 Order + [++ ORDER] */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-blue-600" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Order
                </h2>
              </div>

              <button
                type="button"
                onClick={handleOpenAddOrder}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ + ORDER</span>
              </button>
            </div>

            {/* Sub-bar: Shows [10 ▾] Rows & Search Order */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Order"
                  className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Table (Columns: SL.No, Owner, Order Date ▾, Order Details, Customer, Order Status, Amount, VAT, Total, Receivable, Actions) */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-3">SL.No</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Order Date ▾</th>
                    <th className="py-3 px-3">Order Details</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Order Status</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">VAT</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Receivable</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-20 text-center text-slate-400 font-medium text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-slate-500 font-medium">
                            No orders found. Click "+ ORDER" above to create an order.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 font-bold text-[11px]">
                          {String((currentPage - 1) * rowsPerPage + idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${item.ownerAvatarBg || 'bg-[#011635] text-white'}`}
                            >
                              {(item.owner || 'A').charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{item.owner || 'Al Zaydan'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {item.orderDate}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 max-w-[200px] truncate" title={item.details}>
                          {item.details}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium max-w-[160px] truncate" title={item.customer}>
                          {item.customer}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.orderStatus === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.orderStatus === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.orderStatus === 'Delivered'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : item.orderStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {item.amount}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {item.vat}
                        </td>
                        <td className="py-3 px-3 font-mono font-extrabold text-blue-700">
                          {item.total}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          {item.receivable}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="relative inline-block text-left" data-dropdown-container>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionId(activeActionId === item.id ? null : item.id)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionId === item.id && (
                              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200/90 z-30 py-2 px-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => handleOpenView(item)}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                                  <span>View Order</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenEdit(item);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                                  <span>Edit Order</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDelete(item.id, item.orderNo);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50/70 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600 stroke-[1.8]" />
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

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredList.length)} of {filteredList.length} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg font-bold text-xs bg-[#0055D4] text-white flex items-center justify-center"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </>
      )}



      {/* ================= MODAL: UPLOAD ORDER ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Upload Commercial Orders
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#011635] transition cursor-pointer bg-slate-50/50">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">
                Click to browse or drag & drop CSV / Excel
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supported columns: Order#, Client, Scope, Net Value, VAT, Category
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Sample batch orders uploaded successfully!');
                  setIsUploadModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
