import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Calendar,
  X,
  Plus,
  Settings,
  Trash2,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Edit3,
  Shield,
  Receipt,
  ThumbsUp,
  Info,
  Printer,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';
import CommercialDocumentPdfModal from '../../../components/CommercialDocumentPdfModal';

// Robust deduplication helper: ensures unique quotation records by both id and quotationNo
const deduplicateQuotations = (items) => {
  if (!Array.isArray(items)) return [];
  const seenNos = new Set();
  const seenIds = new Set();
  const result = [];
  for (const item of items) {
    if (!item) continue;
    const cleanNo = (item.quotationNo || '').trim().toLowerCase();
    const cleanId = String(item.id || '');
    if (cleanNo && seenNos.has(cleanNo)) continue;
    if (cleanId && seenIds.has(cleanId)) continue;
    if (cleanNo) seenNos.add(cleanNo);
    if (cleanId) seenIds.add(cleanId);
    result.push(item);
  }
  return result;
};

export default function CommercialOfferView({
  employees = [],
  customers = [],
  opportunities = [],
  onNavigateOpportunity
}) {
  // Mode: 'list' (Matching Reference Image 2) | 'create' (Matching Reference Image 3)
  const [viewMode, setViewMode] = useState('list');

  // Reactive sync tick across window events and cross-tab/view changes
  const [syncTick, setSyncTick] = useState(0);
  useEffect(() => {
    const handleSync = () => setSyncTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('alzaydan_customer_updated', handleSync);
    window.addEventListener('alzaydan_quotation_updated', handleSync);
    window.addEventListener('alzaydan_opportunity_updated', handleSync);
    window.addEventListener('alzaydan_lead_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('alzaydan_customer_updated', handleSync);
      window.removeEventListener('alzaydan_quotation_updated', handleSync);
      window.removeEventListener('alzaydan_opportunity_updated', handleSync);
      window.removeEventListener('alzaydan_lead_updated', handleSync);
    };
  }, []);

  // Filter States (Default to empty date filter so all existing and new quotations are always visible)
  const [filterOwner, setFilterOwner] = useState('All Owners');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [filterQuotationType, setFilterQuotationType] = useState('Select Quotation Type');
  const [filterStatus, setFilterStatus] = useState('All');

  const [filterBizOpp, setFilterBizOpp] = useState('Select');
  const [filterCustomer, setFilterCustomer] = useState('Select Customer');
  const [filterOpportunity, setFilterOpportunity] = useState('Select Opportunity');
  const [filterProductService, setFilterProductService] = useState('Select Product/Service');

  const [filterStage, setFilterStage] = useState('All Stages');

  // Table Sub-controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOfferDetail, setSelectedOfferDetail] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [editingQuotationId, setEditingQuotationId] = useState(null);

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

  // Live Quotations Records (Safely initialized, deduplicated, preserving existing data and deletions)
  const [quotations, setQuotations] = useState(() => {
    const deleted = (() => {
      try {
        return JSON.parse(localStorage.getItem('alzaydan_deleted_quot_ids') || '[]');
      } catch {
        return [];
      }
    })();
    try {
      const saved = localStorage.getItem('alzaydan_crm_quotations');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((q) => !deleted.includes(q.id) && !deleted.includes(q.quotationNo));
          return deduplicateQuotations(filtered);
        }
      }
    } catch {}
    if (deleted.includes('CTSQ#4340') || deleted.includes(1)) {
      return [];
    }
    return [
      {
        id: 1,
        quotationNo: 'CTSQ#4340',
        opportunityCode: 'CTEQ#7539',
        owner: 'muhammed shibil',
        ownerAvatarBg: 'bg-[#011635] text-white',
        date: '16-11-2026',
        opportunity: 'tap',
        customer: 'hai',
        rawAmount: 5250.0,
        amount: 'AED 5,250.00',
        vat: 'AED 262.50',
        total: 'AED 5,512.50',
        status: 'Pending',
        type: 'Supply And Installation',
        bizOpp: 'New Business',
        products: [
          {
            id: 1,
            itemName: 'tap',
            itemCode: 'sd44',
            brand: 'll',
            quantity: 1,
            price: 2000,
            total: 2000
          },
          {
            id: 2,
            itemName: 'glue',
            itemCode: 'fufu44',
            brand: 'lp',
            quantity: 1,
            price: 3000,
            total: 3000
          }
        ]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_crm_quotations', JSON.stringify(deduplicateQuotations(quotations)));
      window.dispatchEvent(new Event('alzaydan_quotation_updated'));
    } catch {}
  }, [quotations]);

  // Compute next available quotation sequence number so duplicates never occur
  const nextQuotationNumber = useMemo(() => {
    let maxNum = 4340;
    quotations.forEach((q) => {
      const match = (q.quotationNo || '').match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n >= maxNum) maxNum = n + 1;
      }
    });
    return `CTSQ#${maxNum}`;
  }, [quotations]);

  // Combined opportunities from props and localStorage with localStorage taking priority
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
    // Default system opportunity matching CTEQ#7539 / tap / hai
    map.set('CTEQ#7539', {
      id: 7539,
      code: 'CTEQ#7539',
      name: 'tap',
      customer: 'hai',
      owner: 'muhammed shibil',
      amount: 'AED 5,250.00',
      rawAmount: 5250.0,
      products: [
        {
          id: 1,
          itemName: 'tap',
          itemCode: 'sd44',
          brand: 'll',
          quantity: 1,
          price: 2000,
          total: 2000
        },
        {
          id: 2,
          itemName: 'glue',
          itemCode: 'fufu44',
          brand: 'lp',
          quantity: 1,
          price: 3000,
          total: 3000
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
  }, [opportunities, syncTick]);

  const handleOpportunitySelect = (oppVal) => {
    if (!oppVal) {
      setAddQuotationForm((prev) => ({
        ...prev,
        opportunity: '',
        opportunityCode: '',
        customer: '',
        amount: '0.00',
        products: []
      }));
      return;
    }
    const matched = availableOpportunities.find(
      (o) =>
        o.code === oppVal ||
        o.name === oppVal ||
        String(o.id) === oppVal ||
        (o.code && oppVal.startsWith(o.code)) ||
        (o.name && oppVal.includes(o.name)) ||
        (o.code && oppVal.includes(o.code))
    );
    if (matched) {
      const rawNum =
        parseFloat(String(matched.rawAmount ?? matched.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;

      let calcOppSum = 0;
      if (Array.isArray(matched.products)) {
        matched.products.forEach((p) => {
          calcOppSum += parseFloat(String(p.total ?? (p.quantity * p.price || 0)).replace(/,/g, '')) || 0;
        });
      }
      const finalAmount =
        calcOppSum > 0
          ? String(calcOppSum.toFixed(2))
          : rawNum > 0
          ? String(rawNum.toFixed(2))
          : prev.amount;

      setAddQuotationForm((prev) => ({
        ...prev,
        opportunity: matched.name,
        opportunityCode: matched.code || '',
        customer: matched.customer || prev.customer || '',
        owner: matched.owner || prev.owner || 'MUHAMMED RISWAN',
        amount: finalAmount,
        products: matched.products || [],
        description:
          prev.description ||
          (matched.name ? `Commercial Proposal for ${matched.name}` : '')
      }));
      toast.success(
        `Auto-filled quotation with Opportunity ${matched.code ? matched.code + ' ' : ''}(${matched.name}) details!`
      );
    } else {
      setAddQuotationForm((prev) => ({ ...prev, opportunity: oppVal }));
    }
  };

  // Full Add Quotation Form State (Image 3)
  const [addQuotationForm, setAddQuotationForm] = useState({
    quotationNumber: 'CTSQ#4341',
    opportunity: '',
    opportunityCode: '',
    customer: '',
    owner: 'MUHAMMED RISWAN',
    fileName: '',
    amount: '0.00',
    vatRate: '5',
    vatType: 'With VAT',
    quotationDate: '16-11-2026',
    quotationType: 'File Upload',
    description: '',
    discount: '0.00',
    adjustment: '0.00',
    updateOpportunityAmount: true,
    products: []
  });

  // Dynamic VAT and Total Calculations for Image 3
  const calculatedVatAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    if (addQuotationForm.vatType === 'With VAT') {
      const rate = parseFloat(addQuotationForm.vatRate) || 0;
      return (net * rate) / 100;
    }
    return 0;
  }, [addQuotationForm.amount, addQuotationForm.discount, addQuotationForm.vatRate, addQuotationForm.vatType]);

  const calculatedTotalAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const adj = parseFloat(String(addQuotationForm.adjustment).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    return net + calculatedVatAmount + adj;
  }, [addQuotationForm.amount, addQuotationForm.discount, addQuotationForm.adjustment, calculatedVatAmount]);

  // PDF Quotation Document Preview Modal State
  const [pdfPreviewModal, setPdfPreviewModal] = useState({
    isOpen: false,
    data: null
  });

  const handleOpenPdfPreview = (quotationData) => {
    if (!quotationData) return;
    setPdfPreviewModal({
      isOpen: true,
      data: quotationData
    });
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewModal({
      isOpen: false,
      data: null
    });
  };

  // Product line items management in Quotation
  const handleAddProductRow = () => {
    const newProduct = {
      id: Date.now() + Math.random(),
      itemName: '',
      description: '',
      itemCode: '',
      brand: '',
      quantity: 1,
      price: '',
      total: 0
    };
    setAddQuotationForm((prev) => {
      const updated = [...(prev.products || []), newProduct];
      return { ...prev, products: updated };
    });
  };

  const handleUpdateProductRow = (id, field, value) => {
    setAddQuotationForm((prev) => {
      const updated = (prev.products || []).map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, [field]: value };
        const q = parseFloat(String(field === 'quantity' ? value : next.quantity)) || 0;
        const pr = parseFloat(String(field === 'price' ? value : next.price).replace(/,/g, '')) || 0;
        next.total = Math.round(q * pr * 100) / 100;
        return next;
      });

      const sumTotal = updated.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {
        ...prev,
        products: updated,
        amount: sumTotal > 0 ? String(sumTotal) : prev.amount
      };
    });
  };

  const handleRemoveProductRow = (id) => {
    setAddQuotationForm((prev) => {
      const updated = (prev.products || []).filter((p) => p.id !== id);
      const sumTotal = updated.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {
        ...prev,
        products: updated,
        amount: sumTotal > 0 ? String(sumTotal) : prev.amount
      };
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterOwner('All Owners');
    setFilterDateRange('');
    setFilterQuotationType('Select Quotation Type');
    setFilterStatus('All');
    setFilterBizOpp('Select');
    setFilterCustomer('Select Customer');
    setFilterOpportunity('Select Opportunity');
    setFilterProductService('Select Product/Service');
    setFilterStage('All Stages');
    setSearchQuery('');
    toast.info('Quotation filters reset to default');
  };

  // Filtered Quotations
  const filteredList = useMemo(() => {
    return quotations.filter((item) => {
      // If user typed or picked a date filter, match against quotation date
      if (filterDateRange.trim()) {
        const fDate = filterDateRange.trim().toLowerCase();
        const itemDate = (item.date || '').toLowerCase();
        if (!itemDate.includes(fDate) && !fDate.includes(itemDate)) {
          return false;
        }
      }

      if (filterOwner !== 'All Owners' && item.owner !== filterOwner) return false;
      if (filterQuotationType !== 'Select Quotation Type' && item.type !== filterQuotationType) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterCustomer !== 'Select Customer' && item.customer !== filterCustomer) return false;
      if (filterBizOpp !== 'Select' && item.bizOpp !== filterBizOpp) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (item.quotationNo || '').toLowerCase().includes(q);
        const matchCust = (item.customer || '').toLowerCase().includes(q);
        const matchOpp = (item.opportunity || '').toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchOpp && !matchOwner) return false;
      }

      return true;
    });
  }, [
    quotations,
    filterDateRange,
    filterOwner,
    filterQuotationType,
    filterStatus,
    filterCustomer,
    filterBizOpp,
    searchQuery
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  // Action Handlers (View, Edit, Revise matching Screenshots 1, 2, 3)
  const handleOpenView = (item) => {
    // If the quotation is linked to an opportunity, sync live opportunity details (code, customer, amount, products, owner)
    const linkedOpp = availableOpportunities.find(
      (o) =>
        o.code === item.opportunityCode ||
        o.name === item.opportunity ||
        o.code === item.opportunity ||
        String(o.id) === item.opportunity ||
        (item.opportunity && o.name && o.name.toLowerCase() === item.opportunity.toLowerCase())
    );

    const prods = (linkedOpp?.products && linkedOpp.products.length > 0)
      ? linkedOpp.products
      : (item?.products && item.products.length > 0)
      ? item.products
      : [
          {
            id: 1,
            itemName: 'tap',
            description: 'Technical spec code: sd44',
            itemCode: 'sd44',
            brand: 'll',
            quantity: 1,
            price: 2000,
            total: 2000
          },
          {
            id: 2,
            itemName: 'glue',
            description: 'Technical spec code: fufu44',
            itemCode: 'fufu44',
            brand: 'lp',
            quantity: 1,
            price: 3000,
            total: 3000
          }
        ];

    let calcSub = 0;
    prods.forEach((p) => {
      calcSub += parseFloat(String(p.total ?? (p.quantity * p.price || 0)).replace(/,/g, '')) || 0;
    });
    const rawNum =
      parseFloat(String(linkedOpp?.rawAmount ?? linkedOpp?.amount ?? item.rawAmount ?? item.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;
    if (rawNum > calcSub) calcSub = rawNum;
    if (calcSub === 0) calcSub = 5250;
    const calcVat = (calcSub * 5) / 100;
    const calcTot = calcSub + calcVat;

    const resolvedCustomer = linkedOpp?.customer || (item.customer === 'SHAHEER' ? 'hai' : (item.customer || 'hai'));
    const resolvedOwner = linkedOpp?.owner || (item.owner === 'shemin' ? 'muhammed shibil' : (item.owner || 'muhammed shibil'));

    setSelectedOfferDetail({
      ...item,
      opportunity: linkedOpp?.name || item.opportunity || 'tap',
      opportunityCode: linkedOpp?.code || item.opportunityCode || 'CTEQ#7539',
      customer: resolvedCustomer,
      owner: resolvedOwner,
      rawAmount: calcSub,
      amount: `AED ${calcSub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      vat: `AED ${calcVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      total: `AED ${calcTot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      products: prods
    });

    setViewMode('view');
    setActiveActionId(null);
  };

  const handleCloseView = () => {
    setSelectedOfferDetail(null);
    setViewMode('list');
  };

  // Dynamic products resolution for the Quotation View
  const currentOfferProducts = useMemo(() => {
    if (selectedOfferDetail?.products && Array.isArray(selectedOfferDetail.products) && selectedOfferDetail.products.length > 0) {
      return selectedOfferDetail.products;
    }
    const matched = availableOpportunities.find(
      (o) =>
        o.code === selectedOfferDetail?.opportunityCode ||
        o.name === selectedOfferDetail?.opportunity ||
        o.code === selectedOfferDetail?.opportunity ||
        (selectedOfferDetail?.opportunity && o.name && o.name.toLowerCase() === selectedOfferDetail.opportunity.toLowerCase())
    );
    if (matched?.products && Array.isArray(matched.products) && matched.products.length > 0) {
      return matched.products;
    }
    return [
      {
        id: 1,
        itemName: 'tap',
        description: 'Technical spec code: sd44',
        itemCode: 'sd44',
        brand: 'll',
        quantity: 1,
        price: 2000,
        total: 2000
      },
      {
        id: 2,
        itemName: 'glue',
        description: 'Technical spec code: fufu44',
        itemCode: 'fufu44',
        brand: 'lp',
        quantity: 1,
        price: 3000,
        total: 3000
      }
    ];
  }, [selectedOfferDetail, availableOpportunities]);

  const offerProductsCalculated = useMemo(() => {
    let sub = 0;
    currentOfferProducts.forEach((p) => {
      const lineTot = parseFloat(String(p.total ?? (p.quantity * p.price || 0)).replace(/,/g, '')) || 0;
      sub += lineTot;
    });
    const offerAmt = parseFloat(String(selectedOfferDetail?.rawAmount ?? selectedOfferDetail?.amount ?? '').replace(/[^0-9.]/g, '')) || 0;
    if (offerAmt > sub) {
      sub = offerAmt;
    }
    if (sub === 0) sub = 5250;
    const vat = (sub * 5) / 100;
    const tot = sub + vat;
    return { sub, vat, tot };
  }, [currentOfferProducts, selectedOfferDetail]);

  const handleOpenEdit = (item) => {
    setActiveActionId(null);
    setEditingQuotationId(item.id);
    const linkedOpp = availableOpportunities.find(
      (o) =>
        o.code === item.opportunityCode ||
        o.name === item.opportunity ||
        o.code === item.opportunity ||
        (item.opportunity && o.name && o.name.toLowerCase() === item.opportunity.toLowerCase())
    );
    const cleanAmt = parseFloat(String(item.rawAmount ?? linkedOpp?.rawAmount ?? item.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanVat = parseFloat(String(item.vat || '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanDiscount = parseFloat(String(item.discount || '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanAdj = parseFloat(String(item.adjustment || '0').replace(/[^0-9.]/g, '')) || 0;
    let rate = '5';
    if (cleanAmt > 0 && cleanVat > 0) {
      rate = String(Math.round((cleanVat / cleanAmt) * 100));
    }

    setAddQuotationForm({
      quotationNumber: item.quotationNo || '',
      opportunity: item.opportunity || linkedOpp?.name || '',
      opportunityCode: item.opportunityCode || linkedOpp?.code || '',
      customer: item.customer || linkedOpp?.customer || '',
      owner: item.owner || linkedOpp?.owner || 'MUHAMMED RISWAN',
      fileName: item.fileName || '',
      amount: cleanAmt > 0 ? String(cleanAmt) : '0.00',
      vatRate: rate,
      vatType: item.vatType || (cleanVat > 0 ? 'With VAT' : 'Without VAT'),
      quotationDate: item.date || '16-11-2026',
      quotationType: item.type || 'File Upload',
      description: item.description || '',
      discount: cleanDiscount > 0 ? String(cleanDiscount) : '0.00',
      adjustment: cleanAdj > 0 ? String(cleanAdj) : '0.00',
      updateOpportunityAmount: true,
      products: item.products || linkedOpp?.products || []
    });
    setViewMode('edit');
  };

  // Open clean Add Quotation screen with next sequential quotation number
  const handleOpenAddQuotation = () => {
    setEditingQuotationId(null);
    setAddQuotationForm({
      quotationNumber: nextQuotationNumber,
      opportunity: '',
      opportunityCode: '',
      customer: '',
      owner: 'MUHAMMED RISWAN',
      fileName: '',
      amount: '0.00',
      vatRate: '5',
      vatType: 'With VAT',
      quotationDate: '16-11-2026',
      quotationType: 'File Upload',
      description: '',
      discount: '0.00',
      adjustment: '0.00',
      updateOpportunityAmount: true,
      products: []
    });
    setViewMode('create');
  };

  // Create Quotation Handler (Image 3)
  const handleAddQuotationSubmit = (e) => {
    e.preventDefault();
    if (!addQuotationForm.opportunity || addQuotationForm.opportunity === 'Select Opportunity') {
      toast.error('Please select an Opportunity');
      return;
    }

    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    const vatVal = addQuotationForm.vatType === 'With VAT' ? (net * (parseFloat(addQuotationForm.vatRate) || 0)) / 100 : 0;
    const adj = parseFloat(String(addQuotationForm.adjustment).replace(/,/g, '')) || 0;
    const totalVal = net + vatVal + adj;
    const cleanNo = (addQuotationForm.quotationNumber || '').trim() || nextQuotationNumber;

    if (editingQuotationId) {
      setQuotations((prev) =>
        deduplicateQuotations(
          prev.map((q) =>
            q.id === editingQuotationId
              ? {
                  ...q,
                  quotationNo: cleanNo,
                  opportunity: addQuotationForm.opportunity,
                  opportunityCode: addQuotationForm.opportunityCode || q.opportunityCode,
                  customer: addQuotationForm.customer || q.customer,
                  owner: addQuotationForm.owner || q.owner || 'MUHAMMED RISWAN',
                  rawAmount: rawAmt,
                  amount: `AED ${rawAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  vat: `AED ${vatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  total: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  type: addQuotationForm.quotationType,
                  date: addQuotationForm.quotationDate || q.date,
                  description: addQuotationForm.description || q.description,
                  products: addQuotationForm.products || q.products || []
                }
              : q
          )
        )
      );
      toast.success(`Quotation "${cleanNo}" updated successfully!`);
      setEditingQuotationId(null);
      setViewMode('list');
      return;
    }

    // Check if quotation with same number already exists - update instead of creating duplicate
    setQuotations((prev) => {
      const existingIdx = prev.findIndex(
        (q) => (q.quotationNo || '').trim().toLowerCase() === cleanNo.toLowerCase()
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          opportunity: addQuotationForm.opportunity,
          opportunityCode: addQuotationForm.opportunityCode || updated[existingIdx].opportunityCode,
          customer: addQuotationForm.customer || updated[existingIdx].customer,
          owner: addQuotationForm.owner || updated[existingIdx].owner || 'MUHAMMED RISWAN',
          rawAmount: rawAmt,
          amount: `AED ${rawAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          vat: `AED ${vatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          total: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          type: addQuotationForm.quotationType,
          date: addQuotationForm.quotationDate || updated[existingIdx].date,
          description: addQuotationForm.description || updated[existingIdx].description,
          products: addQuotationForm.products || updated[existingIdx].products || []
        };
        return deduplicateQuotations(updated);
      }

      const newQuotation = {
        id: Date.now(),
        quotationNo: cleanNo,
        owner: addQuotationForm.owner || 'MUHAMMED RISWAN',
        ownerAvatarBg: 'bg-[#011635] text-white',
        date: addQuotationForm.quotationDate || '16-11-2026',
        opportunity: addQuotationForm.opportunity,
        opportunityCode: addQuotationForm.opportunityCode || '',
        customer: addQuotationForm.customer || 'SHAHEER',
        rawAmount: rawAmt,
        amount: `AED ${rawAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        vat: `AED ${vatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: 'Pending',
        type: addQuotationForm.quotationType,
        bizOpp: 'New Business',
        productService: 'Commercial Technical Services',
        products: addQuotationForm.products || [],
        description: addQuotationForm.description || ''
      };

      return deduplicateQuotations([newQuotation, ...prev]);
    });

    // Clear filter date range so user sees newly created proposal
    setFilterDateRange('');
    toast.success(`Quotation "${cleanNo}" created successfully!`);
    setViewMode('list');

    // Reset and bump quotation sequence
    setAddQuotationForm((prev) => ({
      ...prev,
      quotationNumber: `CTSQ#${4341 + quotations.length}`,
      opportunity: '',
      customer: '',
      amount: '0.00',
      description: '',
      discount: '0.00',
      adjustment: '0.00',
      fileName: ''
    }));
  };

  const handleDelete = (id, no) => {
    const updated = quotations.filter((i) => i.id !== id && i.quotationNo !== no);
    setQuotations(updated);
    try {
      localStorage.setItem('alzaydan_crm_quotations', JSON.stringify(deduplicateQuotations(updated)));
      const deleted = JSON.parse(localStorage.getItem('alzaydan_deleted_quot_ids') || '[]');
      if (id && !deleted.includes(id)) deleted.push(id);
      if (no && !deleted.includes(no)) deleted.push(no);
      localStorage.setItem('alzaydan_deleted_quot_ids', JSON.stringify(deleted));
      window.dispatchEvent(new Event('alzaydan_quotation_updated'));
      window.dispatchEvent(new Event('alzaydan_sales_sync'));
    } catch {}
    if (selectedOfferDetail && (selectedOfferDetail.id === id || selectedOfferDetail.quotationNo === no)) {
      setSelectedOfferDetail(null);
      setViewMode('list');
    }
    toast.success(`Quotation ${no || ''} deleted.`);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TIER 1: ADD & EDIT QUOTATION VIEW (Matching Reference Image)  */}
      {/* ============================================================== */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Header: 📄 Add Quotation / Edit Quotation | Print Button | Red [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{editingQuotationId || viewMode === 'edit' ? 'Edit Quotation' : 'Add Quotation'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPdfPreview(addQuotationForm)}
                className="px-3 py-1.5 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Preview PDF and Print Quotation"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingQuotationId(null);
                  setViewMode('list');
                }}
                className="w-7 h-7 rounded-lg bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Close and return to quotations list"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          <form onSubmit={handleAddQuotationSubmit} className="space-y-6 text-xs">
            {/* 2-Column Responsive Form Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Quotation Number * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Quotation Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={addQuotationForm.quotationNumber}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, quotationNumber: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Quotation sequence settings: CTSQ# active')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-[#0284C7] cursor-pointer"
                      title="Sequence Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Opportunity * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Opportunity <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigateOpportunity ? onNavigateOpportunity() : toast.info('Navigate to Opportunity')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    required
                    value={addQuotationForm.opportunityCode || addQuotationForm.opportunity}
                    onChange={(e) => handleOpportunitySelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Opportunity</option>
                    {availableOpportunities.map((opp) => (
                      <option
                        key={`opp-avail-${opp.id || opp.code || opp.name}`}
                        value={opp.code || opp.name}
                      >
                        {opp.code ? `${opp.code} - ` : ''}{opp.name} {opp.customer ? `(${opp.customer})` : ''}
                      </option>
                    ))}
                    {oppOptions.map((opp) => (
                      <option key={`static-opp-${opp}`} value={opp}>
                        {opp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Customer Name (Auto-filled from Opportunity) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Customer Name
                    </label>
                    {addQuotationForm.customer && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Auto-filled from Opportunity
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Customer Name (Auto-filled from Opportunity)"
                    value={addQuotationForm.customer}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, customer: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 3. File */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    File
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                      <span>Choose file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setAddQuotationForm({ ...addQuotationForm, fileName: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {addQuotationForm.fileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                {/* 4. Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addQuotationForm.amount}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 5. VAT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={addQuotationForm.vatRate}
                        onChange={(e) => setAddQuotationForm({ ...addQuotationForm, vatRate: e.target.value })}
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
                        placeholder="VAT Amount"
                        value={calculatedVatAmount > 0 ? calculatedVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                        className="w-full px-3.5 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Total Amount */}
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
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Quotation Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Quotation Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addQuotationForm.quotationDate}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, quotationDate: e.target.value })}
                      placeholder="dd-mm-yyyy"
                      className="w-full pl-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {addQuotationForm.quotationDate && (
                        <button
                          type="button"
                          onClick={() => setAddQuotationForm({ ...addQuotationForm, quotationDate: '' })}
                          className="hover:text-slate-600 cursor-pointer p-0.5"
                          title="Clear Date"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <label className="cursor-pointer hover:text-blue-600 transition-colors p-1" title="Choose date">
                        <Calendar className="w-3.5 h-3.5" />
                        <input
                          type="date"
                          className="sr-only"
                          onClick={(e) => {
                            try { e.target.showPicker(); } catch {}
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddQuotationForm({ ...addQuotationForm, quotationDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Quotation Type * (Two Dropdowns side-by-side) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Quotation Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={addQuotationForm.quotationType}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, quotationType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="File Upload">File Upload</option>
                      <option value="Standard Quotation">Standard Quotation</option>
                      <option value="Revised Proposal">Revised Proposal</option>
                      <option value="Tender Bid">Tender Bid</option>
                    </select>
                    <select
                      value={addQuotationForm.vatType}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, vatType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                    </select>
                  </div>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={addQuotationForm.description}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, description: e.target.value })}
                    placeholder="Enter proposal description or scope..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none"
                  />
                </div>

                {/* 4. Discount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addQuotationForm.discount}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, discount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 5. Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adjustment
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addQuotationForm.adjustment}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, adjustment: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>
            </div>

            {/* ================= PRODUCT / ITEM DETAILS & DESCRIPTIONS SECTION ================= */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Product / Item Details & Descriptions</h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({(addQuotationForm.products || []).length} {(addQuotationForm.products || []).length === 1 ? 'item' : 'items'})
                  </span>
                  {addQuotationForm.opportunityCode && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Synced from {addQuotationForm.opportunityCode}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddProductRow}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Add Product</span>
                </button>
              </div>

              {(addQuotationForm.products || []).length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/60">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No products linked yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select an opportunity above or click &ldquo;+ Add Product&rdquo; to add line items with Description, Code, Brand, Quantity, and Price.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Add Product</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full min-w-[750px] text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center">#</th>
                          <th className="py-2.5 px-3 min-w-[220px]">Item Name & Description <span className="text-rose-500">*</span></th>
                          <th className="py-2.5 px-3 min-w-[120px]">Item Code</th>
                          <th className="py-2.5 px-3 min-w-[120px]">Brand</th>
                          <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-32 text-right">Unit Price (AED)</th>
                          <th className="py-2.5 px-3 w-32 text-right">Total (AED)</th>
                          <th className="py-2.5 px-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {addQuotationForm.products.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors align-top">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] font-bold">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-2 px-3 space-y-1.5">
                              <input
                                type="text"
                                placeholder="Enter item name..."
                                value={item.itemName || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'itemName', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#011635]"
                              />
                              <input
                                type="text"
                                placeholder="Product description & technical specs..."
                                value={item.description || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'description', e.target.value)}
                                className="w-full px-2.5 py-1 bg-slate-50/80 border border-slate-200/70 rounded-md text-[11px] text-slate-600 outline-none focus:bg-white focus:border-[#011635] placeholder:text-slate-400"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Code / SKU"
                                value={item.itemCode || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'itemCode', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Brand"
                                value={item.brand || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'brand', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) => handleUpdateProductRow(item.id, 'quantity', e.target.value)}
                                className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={item.price || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'price', e.target.value)}
                                className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {(parseFloat(item.total) || ((parseFloat(item.quantity) || 1) * (parseFloat(item.price) || 0))).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveProductRow(item.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Remove line item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddProductRow}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Product</span>
                    </button>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-600 mr-2">Total Products Amount:</span>
                      <span className="text-sm font-extrabold font-mono text-slate-900">
                        AED {(addQuotationForm.products || []).reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Row: [✓] Update quotation amount in opportunity | [Print / PDF Preview] [Submit] [← Back] */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addQuotationForm.updateOpportunityAmount}
                  onChange={(e) => setAddQuotationForm({ ...addQuotationForm, updateOpportunityAmount: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-rose-600">
                  Update quotation amount in opportunity
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview(addQuotationForm)}
                  className="px-4 py-2 bg-[#16477A] hover:bg-[#0f345a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Preview PDF Document and Print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF Preview</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuotationId(null);
                    setViewMode('list');
                  }}
                  className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}


      {/* ============================================================== */}
      {/* TIER: VIEW QUOTATION (Exact Match to Screenshot 1)            */}
      {/* ============================================================== */}
      {viewMode === 'view' && selectedOfferDetail && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden animate-in fade-in duration-150 space-y-0">
          {/* Header Bar: Timestamp | Red [X] */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tracking-wide">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="uppercase text-[11px] font-mono text-slate-600">
                QUOTATION CREATED BY {selectedOfferDetail.owner || 'SHEMIN'} ON {selectedOfferDetail.date || 'MON 18-11-2026 5:45:09 PM'} | QUOTATION LAST MODIFIED BY {selectedOfferDetail.owner || 'SHEMIN'} ON {selectedOfferDetail.date || 'MON 18-11-2026 5:45:17 PM'}
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
            {/* Top 2-Column: Quotation Details & Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Quotation Details */}
              <div className="lg:col-span-6 bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-2 border-b border-slate-200/60">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Quotation Details</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quotation Owner</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                        {(selectedOfferDetail.owner || 'M')[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 uppercase">{selectedOfferDetail.owner || 'MUHAMMED RISWAN'}</span>
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quotation Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOfferDetail.quotationNo || 'CTSQ#4340'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quotation Type</span>
                    <span className="text-slate-800 font-medium">{selectedOfferDetail.type || 'Manual Creation'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quotation Date</span>
                    <span className="font-mono text-slate-700">{selectedOfferDetail.date || '18-11-2026'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Opportunity</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600">
                        {selectedOfferDetail.opportunityCode ? `${selectedOfferDetail.opportunityCode} - ` : ''}
                        {selectedOfferDetail.opportunity || 'TAP'}
                      </span>
                      <Info className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Customer Name</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600">{selectedOfferDetail.customer || 'SHAHEER'}</span>
                      <Info className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Prepared By</span>
                    <span className="font-medium text-slate-800">{selectedOfferDetail.preparedBy || 'SHEMIN'}</span>
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
                    <span className="font-semibold text-slate-800">{selectedOfferDetail.attention || 'Mr. shemeem'}</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Mobile</span>
                    <span className="font-mono text-slate-700">+971 567890987</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00A389] text-white">
                      {selectedOfferDetail.status || 'Approved'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Submitted For Approval</span>
                    <span className="text-slate-600 font-mono text-[11px]">SHEMIN ON MON 18-11-2026 5:45:13 PM</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Approved</span>
                    <span className="text-slate-600 font-mono text-[11px]">SHEMIN ON MON 18-11-2026 5:45:17 PM</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Overview Metric Cards & Itemized Products */}
              <div className="lg:col-span-6 space-y-4">
                <div className="font-bold text-slate-800 text-xs pb-1">
                  <span>Overview</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* AMOUNT */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">AMOUNT</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {offerProductsCalculated.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      $
                    </div>
                  </div>

                  {/* DISCOUNT */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">DISCOUNT</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">0.00</div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* VAT (5%) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">VAT (5%)</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {offerProductsCalculated.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* SUB TOTAL */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">SUB TOTAL</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {offerProductsCalculated.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* ADJUSTMENT */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">ADJUSTMENT</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">0.00</div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* TOTAL AMOUNT */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">TOTAL AMOUNT</div>
                      <div className="text-sm font-extrabold text-[#16477A] mt-0.5">
                        {offerProductsCalculated.tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      $
                    </div>
                  </div>
                </div>

                {/* Products / Items Details (Right Column - Fills Empty Space & Balances Left Column) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#16477A]" />
                      <span className="text-xs font-bold text-slate-800">Products / Items Details</span>
                      {selectedOfferDetail.opportunityCode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-[#16477A] border border-blue-200">
                          {selectedOfferDetail.opportunityCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {currentOfferProducts.length} {currentOfferProducts.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full min-w-[700px] text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-2.5">Code</th>
                          <th className="py-2.5 px-2.5">Brand</th>
                          <th className="py-2.5 px-2 text-center">QTY</th>
                          <th className="py-2.5 px-2.5 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Total (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentOfferProducts.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900 block">{p.itemName || '—'}</span>
                              {(p.description || p.itemCode) && (
                                <span className="text-[10px] text-slate-500 block">
                                  {p.description || `Technical spec code: ${p.itemCode}`}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2.5 font-mono text-slate-600 text-[11px]">{p.itemCode || '—'}</td>
                            <td className="py-2.5 px-2.5 text-slate-700">{p.brand || '—'}</td>
                            <td className="py-2.5 px-2 text-center font-bold text-slate-800">{p.quantity || 1}</td>
                            <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                              {(parseFloat(p.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16477A]">
                              {(parseFloat(p.total ?? (p.quantity * p.price || 0)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-xs">
                          <td colSpan={5} className="py-2 px-3 text-right text-slate-600">
                            Subtotal:
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-900">
                            AED {offerProductsCalculated.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="bg-slate-50/80 font-bold text-xs">
                          <td colSpan={5} className="py-1.5 px-3 text-right text-slate-500 font-medium">
                            5% UAE VAT:
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-700">
                            AED {offerProductsCalculated.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="bg-blue-50/60 font-extrabold text-xs text-[#011635] border-t border-blue-100">
                          <td colSpan={5} className="py-2 px-3 text-right text-[#011635]">
                            Total Amount:
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-[#16477A] text-sm">
                            AED {offerProductsCalculated.tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Scope & Description / Attached Document (if provided) */}
            {(selectedOfferDetail.description || selectedOfferDetail.fileName) && (
              <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                {selectedOfferDetail.description && (
                  <div>
                    <div className="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Proposal Scope &amp; Description</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/70 font-medium">
                      {selectedOfferDetail.description}
                    </p>
                  </div>
                )}

                {selectedOfferDetail.fileName && (
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Attached Document: <strong className="text-slate-900">{selectedOfferDetail.fileName}</strong></span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer">
                      Download Proposal
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Buttons: Back on left, Print/Revise/Edit/Delete on right */}
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
                  onClick={() => handleOpenPdfPreview(selectedOfferDetail)}
                  className="px-3.5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                  title="View PDF Document and Print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedOfferDetail)}
                  className="px-4 py-2 rounded-xl bg-[#1D68F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(selectedOfferDetail.id, selectedOfferDetail.quotationNo);
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
      {/* TIER 2: QUOTATIONS LIST VIEW (Matching Reference Image 2)      */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <>
          {/* ============================================================== */}
          {/* 1. TOP FILTER CARD (Matching Image 2: 3 Rows, 4 Columns)       */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Row 1: Select Owner | Quotation Date | Select Quotation Type | Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Owner
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
                  Quotation Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    placeholder="Filter by date (e.g. 16-11-2026)"
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 font-mono"
                  />
                  {filterDateRange ? (
                    <button
                      type="button"
                      onClick={() => setFilterDateRange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title="Clear date filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Quotation Type
                </label>
                <select
                  value={filterQuotationType}
                  onChange={(e) => { setFilterQuotationType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Quotation Type">Select Quotation Type</option>
                  <option value="File Upload">File Upload</option>
                  <option value="Standard Quotation">Standard Quotation</option>
                  <option value="Revised Proposal">Revised Proposal</option>
                  <option value="Tender Bid">Tender Bid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
              </div>
            </div>

            {/* Row 2: Business Opportunity | Customer | Select Opportunity | Product/Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                  <option value="Renewal">Renewal</option>
                  <option value="Expansion">Expansion</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retrofit">Retrofit</option>
                </select>
              </div>

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
                  Select Opportunity
                </label>
                <select
                  value={filterOpportunity}
                  onChange={(e) => setFilterOpportunity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Opportunity">Select Opportunity</option>
                  {availableOpportunities.map((opp) => (
                    <option key={`filter-opp-${opp.code || opp.name}`} value={opp.name}>
                      {opp.code ? `${opp.code} - ` : ''}{opp.name} {opp.customer ? `(${opp.customer})` : ''}
                    </option>
                  ))}
                  {oppOptions.map((opp) => (
                    <option key={`static-filter-opp-${opp}`} value={opp}>
                      {opp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Product/Service
                </label>
                <select
                  value={filterProductService}
                  onChange={(e) => setFilterProductService(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Product/Service">Select Product/Service</option>
                  <option value="Industrial Refrigeration">Industrial Refrigeration</option>
                  <option value="Chemical Feedstock">Chemical Feedstock</option>
                  <option value="Cold Storage Installation">Cold Storage Installation</option>
                  <option value="Fleet Maintenance">Fleet Maintenance</option>
                  <option value="Commercial Technical Services">Commercial Technical Services</option>
                </select>
              </div>
            </div>

            {/* Row 3: Opportunity Stage + Reset Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Opportunity Stage
                </label>
                <select
                  value={filterStage}
                  onChange={(e) => { setFilterStage(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All Stages">All Stages</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
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
          {/* 2. TABLE CONTAINER (Matching Image 2: Header + Shows + Table)   */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Action Header: 📄 Quotation + [+ QUOTATION] */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Quotation
                </h2>
              </div>

              <button
                type="button"
                onClick={handleOpenAddQuotation}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ QUOTATION</span>
              </button>
            </div>

            {/* Sub-bar: Shows [10 ▾] Rows & Search Quotation */}
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
                  placeholder="Search Quotation"
                  className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Table (Columns: SL.No, Quotation#, Owner, Date ▾, Opportunity, Customer, Amount, VAT, Total, Status, Actions) */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-3">SL.No</th>
                    <th className="py-3 px-3">Quotation#</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Date ▾</th>
                    <th className="py-3 px-3">Opportunity</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">VAT</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-20 text-center text-slate-400 font-medium text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileText className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                          <span className="font-bold text-slate-600">No quotation records found.</span>
                          <span className="text-[11px] text-slate-400">
                            Click '+ QUOTATION' above to create a new commercial proposal.
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
                        <td className="py-3 px-3 font-mono font-bold text-blue-600 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenView(item)}
                            className="hover:underline cursor-pointer font-mono font-bold text-blue-600 text-xs text-left"
                          >
                            {item.quotationNo}
                          </button>
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
                          {item.date}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-[200px]" title={item.opportunity}>
                          <div>
                            <span className="font-bold text-slate-800">{item.opportunity}</span>
                            {item.opportunityCode && (
                              <span className="block font-mono text-[10px] text-blue-600 font-semibold">{item.opportunityCode}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-bold max-w-[150px] truncate" title={item.customer}>
                          {item.customer}
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
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'Negotiation'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : item.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
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
                              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 z-30 py-2 px-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => handleOpenView(item)}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <BookOpen className="w-4 h-4 text-slate-600 stroke-[1.8]" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-slate-600 stroke-[1.8]" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenPdfPreview(item);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-[#011635] hover:bg-slate-50 rounded-lg flex items-center gap-3 font-semibold transition cursor-pointer"
                                >
                                  <Printer className="w-4 h-4 text-[#16477A] stroke-[1.8]" />
                                  <span>Print / PDF</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDelete(item.id, item.quotationNo);
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
            {filteredList.length > 0 && (
              <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredList.length)} to{' '}
                  {Math.min(currentPage * rowsPerPage, filteredList.length)} of {filteredList.length} entries
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
                        currentPage === pg
                          ? 'bg-[#011635] text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* COMMERCIAL QUOTATION PDF DOCUMENT PREVIEW MODAL                */}
      {/* ============================================================== */}
      <CommercialDocumentPdfModal
        isOpen={pdfPreviewModal.isOpen}
        onClose={handleClosePdfPreview}
        docType="QUOTATION"
        data={pdfPreviewModal.data}
      />
    </div>
  );
}

export { CommercialOfferView as QuotationView };
