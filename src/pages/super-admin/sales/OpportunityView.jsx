import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  Search,
  Clock,
  Calendar,
  X,
  ShoppingCart,
  Layers,
  UploadCloud,
  UserCheck,
  Plus,
  Settings,
  ChevronDown,
  Edit3,
  Trash2,
  SlidersHorizontal,
  RotateCw,
  Info,
  User,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Package,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';
import { normalizeOpportunity } from '../../../utils/salesUtils';
import CommercialDocumentPdfModal from '../../../components/CommercialDocumentPdfModal';

export default function OpportunityView({
  employees = [],
  customers = [],
  leads = [],
  opportunities: propOpportunities,
  setOpportunities: propSetOpportunities
}) {
  // Top Status Pill
  const [activePill, setActivePill] = useState('Open'); // 'All' | 'Unread' | 'Open' | 'Today' | 'Overdue' | 'Upcoming' | 'Lost' | 'Order' | 'Overview'

  // Filter Criteria States
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterClassification, setFilterClassification] = useState('All Classification');

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
  const [filterStage, setFilterStage] = useState('All Stages');
  const [filterRating, setFilterRating] = useState('All');
  const [filterBizType, setFilterBizType] = useState('Select Type');
  const [filterOwner, setFilterOwner] = useState('All Owners');
  const [filterCampaign, setFilterCampaign] = useState('Select Campaign');
  const [filterCreatedBy, setFilterCreatedBy] = useState('All');
  const [filterTags, setFilterTags] = useState('');
  const [showFilterSidebar, setShowFilterSidebar] = useState(true);

  // Table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeActionId, setActiveActionId] = useState(null);
  const [activeStageDropdownId, setActiveStageDropdownId] = useState(null);
  const [detailStageDropdownOpen, setDetailStageDropdownOpen] = useState(false);
  const [viewTargetOpp, setViewTargetOpp] = useState(null);
  const [editingOppId, setEditingOppId] = useState(null);
  const [assignOppTarget, setAssignOppTarget] = useState(null);
  const [selectedAssignOwner, setSelectedAssignOwner] = useState(defaultOwner);
  const [quotationOppTarget, setQuotationOppTarget] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('Opportunity');
  const [activeActivityTab, setActiveActivityTab] = useState('Notes');

  // Unified stage configuration with probabilities and visual styling
  const STAGE_CONFIG = [
    { label: 'Enquiry', probability: 10, color: 'bg-[#1D68F2] text-white', barColor: 'bg-blue-500', icon: '📝' },
    { label: 'Qualification', probability: 30, color: 'bg-amber-600 text-white', barColor: 'bg-amber-500', icon: '🔍' },
    { label: 'Offer Sent', probability: 60, color: 'bg-indigo-600 text-white', barColor: 'bg-indigo-500', icon: '📤' },
    { label: 'Negotiation', probability: 80, color: 'bg-purple-600 text-white', barColor: 'bg-purple-500', icon: '🤝' },
    { label: 'Won', probability: 100, color: 'bg-emerald-600 text-white', barColor: 'bg-emerald-500', icon: '🎉' },
    { label: 'Lost', probability: 0, color: 'bg-rose-600 text-white', barColor: 'bg-rose-500', icon: '❌' }
  ];

  // Dynamic financial calculation for viewTargetOpp (Actual Price, VAT, Total Amount)
  const oppFinancials = useMemo(() => {
    if (!viewTargetOpp) return { actualPrice: 0, vat: 0, total: 0 };

    let productSum = 0;
    if (viewTargetOpp.products && Array.isArray(viewTargetOpp.products) && viewTargetOpp.products.length > 0) {
      viewTargetOpp.products.forEach((p) => {
        const itemTot = parseFloat(String(p.total ?? (p.quantity * p.price || 0)).replace(/,/g, '')) || 0;
        productSum += itemTot;
      });
    }

    const totalRaw =
      parseFloat(String(viewTargetOpp.rawAmount ?? viewTargetOpp.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;

    let actualPrice = productSum;
    let vat = 0;
    let total = totalRaw;

    if (actualPrice > 0) {
      vat = (actualPrice * 5) / 100;
      total = actualPrice + vat;
    } else if (totalRaw > 0) {
      actualPrice = totalRaw / 1.05;
      vat = totalRaw - actualPrice;
      total = totalRaw;
    }

    return {
      actualPrice,
      vat,
      total
    };
  }, [viewTargetOpp]);

  // Full Add Quotation Form State (Image 4)
  const [addQuotationForm, setAddQuotationForm] = useState({
    quotationNumber: 'CTSQ#4417',
    quotationDate: '18-11-2026',
    opportunity: '',
    quotationType: 'File Upload',
    vatType: 'With VAT',
    vatRate: '5',
    description: '',
    amount: '1309.35',
    discount: '0.00',
    adjustment: '0.00',
    updateOpportunityAmount: true,
    fileName: ''
  });

  const quoteCalculatedVat = useMemo(() => {
    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    if (addQuotationForm.vatType === 'With VAT') {
      const rate = parseFloat(addQuotationForm.vatRate) || 0;
      return (net * rate) / 100;
    }
    return 0;
  }, [addQuotationForm.amount, addQuotationForm.discount, addQuotationForm.vatRate, addQuotationForm.vatType]);

  const quoteCalculatedTotal = useMemo(() => {
    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const adj = parseFloat(String(addQuotationForm.adjustment).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    return net + quoteCalculatedVat + adj;
  }, [addQuotationForm.amount, addQuotationForm.discount, addQuotationForm.adjustment, quoteCalculatedVat]);

  // Close actions and stage dropdowns on outside click
  useEffect(() => {
    if (!activeActionId && !activeStageDropdownId && !detailStageDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-dropdown-container]') && !e.target.closest('[data-stage-dropdown]')) {
        setActiveActionId(null);
        setActiveStageDropdownId(null);
        setDetailStageDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeActionId, activeStageDropdownId, detailStageDropdownOpen]);

  // Modals & View Mode
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'view' | 'create-quotation'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Full Add Opportunity Form State (Clean Initial State with No Mock Data)
  const [addOppForm, setAddOppForm] = useState({
    customerName: '',
    opportunityOwner: defaultOwner,
    opportunityTitle: '',
    source: 'Direct Inbound',
    sourceName: '',
    rating: 'COLD',
    closeDate: '',
    discount: '0.00',
    vatRate: '5',
    vatType: 'With VAT',
    amount: '',
    adjustment: '0.00',
    businessOpportunity: '',
    deliveryDate: '',
    lpoDate: '',
    competitorsDetails: '',
    type: 'New Business',
    location: '',
    reference: '',
    opportunityNumber: 'CTEQ#7539',
    leadNumber: '',
    opportunityDate: '16-11-2026',
    pointOfContact: '',
    stage: 'Enquiry',
    campaign: '',
    opportunityTags: '',
    lpoNumber: '',
    nextAction: '',
    winProbability: 10,
    comments: '',
    deliveryMethod: '',
    contactPerson: '',
    products: []
  });

  // Dynamic business opportunity categories (Persisted to localStorage)
  const [businessOppOptions, setBusinessOppOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_business_opportunities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [
      'Industrial Chillers Supply',
      'Commercial HVAC Retrofit',
      'District Cooling Substations',
      'Cold Storage Expansion Phase 2',
      'Annual Maintenance Contract (AMC)',
      'VRF / VRV System Installation',
      'Cleanroom Air Handling Units',
      'Ductwork & Ventilation Overhaul'
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_business_opportunities', JSON.stringify(businessOppOptions));
    } catch { }
  }, [businessOppOptions]);

  // Dynamic opportunity types
  const [oppTypeOptions, setOppTypeOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_opp_types');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return ['New Business', 'Expansion', 'Renewal', 'Maintenance', 'Retrofit', 'Commercial HVAC', 'Industrial Chiller'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_opp_types', JSON.stringify(oppTypeOptions));
    } catch { }
  }, [oppTypeOptions]);

  // Dynamic storage sync trigger
  const [syncTick, setSyncTick] = useState(0);
  useEffect(() => {
    const handleSync = () => setSyncTick((t) => t + 1);
    window.addEventListener('alzaydan_customer_updated', handleSync);
    window.addEventListener('alzaydan_lead_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('alzaydan_customer_updated', handleSync);
      window.removeEventListener('alzaydan_lead_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Unified dynamic customers combining props and localStorage
  const allCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? [...customers] : [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c.name && !list.some((item) => (item.name || '').toLowerCase() === c.name.toLowerCase())) {
              list.push(c);
            }
          });
        }
      }
    } catch { }
    return list;
  }, [customers, syncTick]);

  // Quick Add Modal State for all "+ New" buttons
  const [quickAddModal, setQuickAddModal] = useState({
    isOpen: false,
    type: '', // 'businessOpportunity' | 'customer' | 'lead' | 'owner' | 'type'
    title: '',
    name: '',
    extra1: '',
    extra2: '',
    extra3: ''
  });

  const handleOpenQuickModal = (type) => {
    const titles = {
      businessOpportunity: 'Add New Business Opportunity',
      customer: 'Quick Add New Customer',
      lead: 'Quick Add New Lead',
      owner: 'Add New Opportunity Owner',
      type: 'Add New Opportunity Type'
    };
    setQuickAddModal({
      isOpen: true,
      type,
      title: titles[type] || 'Add New Item',
      name: '',
      extra1: '',
      extra2: '',
      extra3: ''
    });
  };

  const handleSaveQuickModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanName = (quickAddModal.name || '').trim();

    if (!cleanName) {
      toast.error('Please enter a valid title or name');
      return;
    }

    if (quickAddModal.type === 'businessOpportunity') {
      if (!businessOppOptions.includes(cleanName)) {
        setBusinessOppOptions((prev) => [cleanName, ...prev]);
      }
      setAddOppForm((prev) => ({ ...prev, businessOpportunity: cleanName }));
      toast.success(`Business Opportunity "${cleanName}" added and selected!`);
    } else if (quickAddModal.type === 'type') {
      if (!oppTypeOptions.includes(cleanName)) {
        setOppTypeOptions((prev) => [cleanName, ...prev]);
      }
      setAddOppForm((prev) => ({ ...prev, type: cleanName }));
      toast.success(`Opportunity Type "${cleanName}" added and selected!`);
    } else if (quickAddModal.type === 'customer') {
      const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const pContact = (quickAddModal.extra1 || '').trim() || cleanName;
      const ph = (quickAddModal.extra2 || '').trim() || '+971 50 123 4567';
      const em = (quickAddModal.extra3 || '').trim() || 'info@client.ae';
      const newCustomer = {
        id: Date.now(),
        code: `AZ-CUST-${100 + allCustomers.length + 1}`,
        date: todayStr,
        name: cleanName,
        customerName: cleanName,
        company: cleanName,
        owner: addOppForm.opportunityOwner || 'Super Admin',
        ownerAvatarBg: 'bg-[#011635] text-white',
        primaryContact: pContact,
        contactPerson: pContact,
        phone: ph,
        contactPhone: ph,
        email: em,
        contactEmail: em,
        location: 'Dubai, UAE',
        address: 'Dubai, UAE',
        industry: 'Commercial Trading',
        lastEnquiry: todayStr,
        openEnquiries: '1 Enquiry',
        lastOrder: 'N/A',
        outstanding: 'AED 0.00',
        status: 'Active',
        stage: 'Active Customer',
        type: 'Customer',
        createdAt: todayStr
      };
      try {
        const saved = JSON.parse(localStorage.getItem('alzaydan_crm_customers') || '[]');
        localStorage.setItem('alzaydan_crm_customers', JSON.stringify([newCustomer, ...saved]));
        window.dispatchEvent(new Event('alzaydan_customer_updated'));
      } catch { }
      setAddOppForm((prev) => ({
        ...prev,
        customerName: cleanName,
        pointOfContact: pContact,
        contactPerson: pContact
      }));
      toast.success(`Customer "${cleanName}" created and selected!`);
    } else if (quickAddModal.type === 'lead') {
      const leadNum = `LD#${Math.floor(1000 + Math.random() * 9000)}`;
      const newLead = {
        id: Date.now(),
        leadCode: leadNum,
        codeNum: leadNum,
        name: cleanName,
        company: cleanName,
        contactName: (quickAddModal.extra1 || '').trim(),
        phone: (quickAddModal.extra2 || '').trim(),
        status: 'New',
        assignedTo: addOppForm.opportunityOwner || 'Super Admin',
        createdAt: new Date().toLocaleDateString('en-GB')
      };
      try {
        const saved = JSON.parse(localStorage.getItem('alzaydan_crm_leads') || '[]');
        localStorage.setItem('alzaydan_crm_leads', JSON.stringify([newLead, ...saved]));
        window.dispatchEvent(new Event('alzaydan_lead_updated'));
      } catch { }
      setAddOppForm((prev) => ({
        ...prev,
        leadNumber: leadNum
      }));
      toast.success(`Lead "${leadNum} - ${cleanName}" generated and linked!`);
    } else if (quickAddModal.type === 'owner') {
      const newOwner = {
        id: Date.now(),
        name: cleanName,
        role: (quickAddModal.extra1 || 'Sales Executive').trim(),
        roleTier: 'staff',
        designation: (quickAddModal.extra1 || 'Sales Executive').trim(),
        status: 'Active'
      };
      try {
        const saved = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
        localStorage.setItem('alzaydan_custom_employees', JSON.stringify([newOwner, ...saved]));
        window.dispatchEvent(new Event('alzaydan_user_updated'));
      } catch { }
      setAddOppForm((prev) => ({
        ...prev,
        opportunityOwner: cleanName
      }));
      toast.success(`Opportunity Owner "${cleanName}" added and selected!`);
    }

    setQuickAddModal({
      isOpen: false,
      type: '',
      title: '',
      name: '',
      extra1: '',
      extra2: '',
      extra3: ''
    });
  };

  // Sum of product line items
  const productsSumTotal = useMemo(() => {
    return (addOppForm.products || []).reduce(
      (sum, item) => sum + (parseFloat(item.total) || 0),
      0
    );
  }, [addOppForm.products]);

  // PDF Opportunity Document Preview Modal State
  const [pdfPreviewModal, setPdfPreviewModal] = useState({
    isOpen: false,
    data: null
  });

  const handleOpenPdfPreview = (oppData) => {
    if (!oppData) return;
    setPdfPreviewModal({
      isOpen: true,
      data: oppData
    });
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewModal({
      isOpen: false,
      data: null
    });
  };

  // Product details line items management
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
    setAddOppForm((prev) => ({
      ...prev,
      products: [...(prev.products || []), newProduct]
    }));
  };

  const handleUpdateProductRow = (id, field, value) => {
    setAddOppForm((prev) => {
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
    setAddOppForm((prev) => {
      const updated = (prev.products || []).filter((p) => p.id !== id);
      const sumTotal = updated.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {
        ...prev,
        products: updated,
        amount: sumTotal > 0 ? String(sumTotal) : prev.amount
      };
    });
  };

  // Open fresh Add Opportunity form
  const handleOpenAddOpportunity = () => {
    setEditingOppId(null);
    setAddOppForm({
      customerName: '',
      opportunityOwner: defaultOwner,
      opportunityTitle: '',
      source: 'Direct Inbound',
      sourceName: '',
      rating: 'COLD',
      closeDate: '',
      discount: '0.00',
      vatRate: '5',
      vatType: 'With VAT',
      amount: '',
      adjustment: '0.00',
      businessOpportunity: '',
      deliveryDate: '',
      lpoDate: '',
      competitorsDetails: '',
      type: 'New Business',
      location: '',
      reference: '',
      opportunityNumber: `CTEQ#${7539 + opportunities.length}`,
      leadNumber: '',
      opportunityDate: '16-11-2026',
      pointOfContact: '',
      stage: 'Enquiry',
      campaign: '',
      opportunityTags: '',
      lpoNumber: '',
      nextAction: '',
      winProbability: 10,
      comments: '',
      deliveryMethod: '',
      contactPerson: '',
      products: []
    });
    setViewMode('create');
  };

  // Dynamic math for VAT Amount and Total Amount
  const calculatedVatAmount = useMemo(() => {
    const amt = parseFloat(String(addOppForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addOppForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, amt - disc);
    if (addOppForm.vatType === 'With VAT') {
      return (net * (parseFloat(addOppForm.vatRate) || 0)) / 100;
    }
    return 0;
  }, [addOppForm.amount, addOppForm.discount, addOppForm.vatRate, addOppForm.vatType]);

  const calculatedTotalAmount = useMemo(() => {
    const amt = parseFloat(String(addOppForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addOppForm.discount).replace(/,/g, '')) || 0;
    const adj = parseFloat(String(addOppForm.adjustment).replace(/,/g, '')) || 0;
    const net = Math.max(0, amt - disc);
    return net + calculatedVatAmount + adj;
  }, [addOppForm.amount, addOppForm.discount, addOppForm.adjustment, calculatedVatAmount]);

  // Legacy modal form state
  const [formData, setFormData] = useState({
    name: '',
    customer: '',
    owner: defaultOwner,
    amount: '',
    stage: 'Enquiry',
    probability: 10,
    rating: 'COLD',
    closeDate: '',
    campaign: ''
  });

  // Live Opportunities Data (Safely initialized from props or storage, preserving existing user data)
  const [opportunities, setOpportunities] = useState(() => {
    let raw = [];
    if (Array.isArray(propOpportunities) && propOpportunities.length > 0) {
      raw = propOpportunities;
    } else {
      try {
        const saved = localStorage.getItem('alzaydan_crm_opportunities');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
        }
      } catch { }
    }
    return raw.map(normalizeOpportunity).filter(Boolean);
  });

  useEffect(() => {
    if (opportunities.length > 0) {
      try {
        localStorage.setItem('alzaydan_crm_opportunities', JSON.stringify(opportunities));
      } catch { }
    }
    if (typeof propSetOpportunities === 'function') {
      propSetOpportunities(opportunities);
    }
  }, [opportunities, propSetOpportunities]);

  // Handler to dynamically update an opportunity's stage and probability
  const handleUpdateStage = (oppId, newStage) => {
    const matched = STAGE_CONFIG.find((s) => s.label.toLowerCase() === (newStage || '').toLowerCase()) || {
      label: newStage,
      probability: 10
    };

    const newStatus = matched.label === 'Lost' ? 'Lost' : matched.label === 'Won' ? 'Won' : 'Open';

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          return {
            ...opp,
            stage: matched.label,
            status: newStatus,
            probability: matched.probability,
            lastModified: new Date().toLocaleDateString('en-GB')
          };
        }
        return opp;
      })
    );

    if (viewTargetOpp && viewTargetOpp.id === oppId) {
      setViewTargetOpp((prev) => ({
        ...prev,
        stage: matched.label,
        status: newStatus,
        probability: matched.probability
      }));
    }

    toast.success(`Opportunity stage updated to "${matched.label}" (${matched.probability}%)`);
  };

  // Available leads from props and localStorage (safe, non-destructive, sanitized)
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
    } catch { }
    return list.map((l) => {
      let comp = (l.company || l.customerName || '').trim();
      let cust = (l.customerName || l.company || '').trim();
      let cont = (l.contactName || '').trim();
      if (comp === 'New Enterprise Client') comp = '';
      if (cust === 'New Enterprise Client') cust = '';
      if (!cust && comp) cust = comp;
      if (!comp && cust) comp = cust;
      if (!cust && cont) cust = cont;
      if (!comp && cont) comp = cont;
      return { ...l, company: comp, customerName: cust, contactName: cont };
    });
  }, [leads, syncTick]);

  const handleLeadSelect = (selectedCode) => {
    if (!selectedCode || selectedCode === 'Direct Opportunity (No Lead)') {
      setAddOppForm((prev) => ({
        ...prev,
        leadNumber: selectedCode
      }));
      return;
    }

    const cleanCode = String(selectedCode || '').trim().toLowerCase();
    const matchedLead = availableLeads.find((l) => {
      const lCode = String(l.leadCode || '').trim().toLowerCase();
      const cNum = String(l.codeNum || '').trim().toLowerCase();
      const lId = String(l.id || '').trim().toLowerCase();
      const lNum = String(l.leadNumber || '').trim().toLowerCase();
      return (
        lCode === cleanCode ||
        cNum === cleanCode ||
        lId === cleanCode ||
        lNum === cleanCode ||
        (lCode && cleanCode.includes(lCode))
      );
    });

    if (matchedLead) {
      // 1. Strictly Customer Name (Company/Organization)
      let rawCust = (
        (matchedLead.customerName && matchedLead.customerName !== 'New Enterprise Client' ? matchedLead.customerName : '') ||
        (matchedLead.company && matchedLead.company !== 'New Enterprise Client' ? matchedLead.company : '') ||
        matchedLead.contactName ||
        matchedLead.name ||
        ''
      ).trim();
      if (!rawCust || rawCust === 'New Enterprise Client') {
        rawCust = 'Commercial Client';
      }
      const companyOrCust = rawCust;

      // 2. Strictly Point of Contact (Individual Contact Person)
      const personName = (
        matchedLead.contactName ||
        (matchedLead.name && matchedLead.name.toLowerCase() !== companyOrCust.toLowerCase() ? matchedLead.name : '') ||
        companyOrCust
      ).trim();

      // 3. Matched Owner from available users
      const rawOwner = (matchedLead.assignedTo || matchedLead.owner || 'Super Admin').trim();
      const matchedUser = availableUsers.find(
        (u) =>
          u.name.toLowerCase() === rawOwner.toLowerCase() ||
          rawOwner.toLowerCase().includes(u.name.toLowerCase()) ||
          u.name.toLowerCase().includes(rawOwner.toLowerCase())
      );
      const finalOwner = matchedUser ? matchedUser.name : (rawOwner || defaultOwner);

      // 4. Business Opportunity
      const leadBiz = (matchedLead.businessOpportunity || matchedLead.opportunity || '').trim();
      if (leadBiz && !businessOppOptions.includes(leadBiz)) {
        setBusinessOppOptions((prev) => [leadBiz, ...prev]);
        try {
          const savedBiz = JSON.parse(localStorage.getItem('alzaydan_business_opportunities') || '[]');
          if (!savedBiz.includes(leadBiz)) {
            localStorage.setItem('alzaydan_business_opportunities', JSON.stringify([leadBiz, ...savedBiz]));
          }
        } catch { }
      }

      // 5. Ensure customer exists in localStorage directory so CRM tables and dropdowns have it
      if (companyOrCust && companyOrCust !== 'Commercial Client') {
        try {
          const saved = JSON.parse(localStorage.getItem('alzaydan_crm_customers') || '[]');
          if (!saved.some((c) => (c.name || '').toLowerCase() === companyOrCust.toLowerCase())) {
            const newCustObj = {
              id: Date.now(),
              code: `AZ-CUST-${100 + saved.length + 1}`,
              date: matchedLead.date || matchedLead.leadDate || '16-11-2026',
              name: companyOrCust,
              company: companyOrCust,
              customerName: companyOrCust,
              primaryContact: personName,
              contactPerson: personName,
              phone: matchedLead.phone || matchedLead.businessMobile || '+971 50 123 4567',
              email: matchedLead.email || 'info@client.ae',
              location: matchedLead.location || 'Dubai, UAE',
              owner: finalOwner,
              status: 'Active',
              type: 'Customer'
            };
            localStorage.setItem('alzaydan_crm_customers', JSON.stringify([newCustObj, ...saved]));
            window.dispatchEvent(new Event('alzaydan_customer_updated'));
          }
        } catch { }
      }

      // Update Opportunity Form (keep Opportunity Title untouched as requested)
      setAddOppForm((prev) => ({
        ...prev,
        leadNumber: matchedLead.leadCode || selectedCode,
        customerName: companyOrCust,
        opportunityOwner: finalOwner,
        pointOfContact: personName,
        contactPerson: personName,
        location: matchedLead.location || prev.location || 'Dubai, UAE',
        opportunityTitle: prev.opportunityTitle || '',
        source: matchedLead.source || prev.source || 'Direct Inbound',
        sourceName: matchedLead.sourceName || prev.sourceName || '',
        rating: matchedLead.rating || prev.rating || 'COLD',
        businessOpportunity: leadBiz || prev.businessOpportunity,
        campaign: matchedLead.campaign || prev.campaign || '',
        opportunityTags: matchedLead.leadTags || matchedLead.tags || prev.opportunityTags || '',
        opportunityDate: matchedLead.date || matchedLead.leadDate || prev.opportunityDate
      }));

      toast.success(`Auto-filled details from Lead ${matchedLead.leadCode || selectedCode} (${companyOrCust})!`);
    } else {
      setAddOppForm((prev) => ({
        ...prev,
        leadNumber: selectedCode
      }));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterCustomer('');
    setFilterClassification('All Classification');
    setFilterStage('All Stages');
    setFilterRating('All');
    setFilterBizType('Select Type');
    setFilterOwner('All Owners');
    setFilterCampaign('Select Campaign');
    setFilterCreatedBy('All');
    setFilterTags('');
    setSearchQuery('');
    toast.info('Opportunity filters reset');
  };

  // Filtered Opportunities (fully normalized and null-safe)
  const filteredList = useMemo(() => {
    const list = (opportunities || []).map(normalizeOpportunity).filter(Boolean);
    return list.filter((item) => {
      // Pill filter
      if (activePill === 'Open' && item.status !== 'Open') return false;
      if (activePill === 'Lost' && item.status !== 'Lost') return false;
      if (activePill === 'Order' && item.status !== 'Order') return false;

      // Filter criteria
      const custStr = (item.customer || '').toLowerCase();
      if (filterCustomer.trim() && !custStr.includes(filterCustomer.toLowerCase())) {
        return false;
      }
      if (filterClassification !== 'All Classification' && item.classification !== filterClassification) {
        return false;
      }
      if (filterStage !== 'All Stages' && item.stage !== filterStage) {
        return false;
      }
      if (filterRating !== 'All' && item.rating !== filterRating) {
        return false;
      }
      if (filterBizType !== 'Select Type' && item.bizType !== filterBizType) {
        return false;
      }
      if (filterOwner !== 'All Owners' && item.owner !== filterOwner) {
        return false;
      }
      if (filterCampaign !== 'Select Campaign' && item.campaign !== filterCampaign) {
        return false;
      }

      // Search bar
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCust = (item.customer || '').toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        const matchCode = (item.code || '').toLowerCase().includes(q);
        if (!matchName && !matchCust && !matchOwner && !matchCode) return false;
      }

      return true;
    });
  }, [
    opportunities,
    activePill,
    filterCustomer,
    filterClassification,
    filterStage,
    filterRating,
    filterBizType,
    filterOwner,
    filterCampaign,
    searchQuery
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pagedList.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add Opportunity submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter Opportunity Name');
      return;
    }

    const newOpp = {
      id: Date.now(),
      code: `OPP-${Math.floor(1000 + Math.random() * 9000)}`,
      owner: formData.owner,
      ownerAvatarBg: 'bg-[#011635] text-white',
      oppDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      name: formData.name.trim(),
      customer: formData.customer,
      lastActivity: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      lastActivityDays: 'Today',
      closeDate: formData.closeDate || '28-11-2026',
      stage: formData.stage,
      probability: Number(formData.probability) || 60,
      rating: formData.rating,
      classification: 'A - Enterprise',
      bizType: 'New Business',
      campaign: formData.campaign,
      amount: `AED ${Number(formData.amount.replace(/[^0-9]/g, '')).toLocaleString()}`,
      status: 'Open'
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    toast.success(`Opportunity "${newOpp.name}" added successfully!`);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      customer: '',
      owner: defaultOwner,
      amount: '',
      stage: 'Enquiry',
      probability: 10,
      rating: 'COLD',
      closeDate: '',
      campaign: ''
    });
  };

  // Submit handler for full Add/Edit Opportunity form (matching Image 2)
  const handleAddOpportunitySubmit = (e) => {
    e.preventDefault();
    if (!addOppForm.opportunityTitle.trim()) {
      toast.error('Please enter an Opportunity Title');
      return;
    }

    if (editingOppId) {
      const updatedOpp = normalizeOpportunity({
        ...addOppForm,
        id: editingOppId,
        code: addOppForm.opportunityNumber,
        name: addOppForm.opportunityTitle.trim(),
        customer: addOppForm.customerName,
        owner: addOppForm.opportunityOwner,
        stage: addOppForm.stage,
        probability: Number(addOppForm.winProbability) || 10,
        rating: addOppForm.rating,
        closeDate: addOppForm.closeDate || '19-11-2026',
        amount: `AED ${calculatedTotalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        products: addOppForm.products || []
      });

      setOpportunities((prev) =>
        prev.map((o) => (o.id === editingOppId ? updatedOpp : o))
      );
      if (viewTargetOpp && viewTargetOpp.id === editingOppId) {
        setViewTargetOpp(updatedOpp);
      }
      toast.success(`Opportunity "${updatedOpp.name}" updated successfully!`);
      setEditingOppId(null);
      setViewMode('list');
      return;
    }

    const nextId = Date.now();
    const newOpp = {
      id: nextId,
      code: addOppForm.opportunityNumber || `CTEQ#${7539 + opportunities.length}`,
      owner: addOppForm.opportunityOwner,
      ownerAvatarBg: 'bg-[#011635] text-white',
      oppDate: addOppForm.opportunityDate || '16-11-2026',
      assignedDate: addOppForm.opportunityDate || '16-11-2026',
      name: addOppForm.opportunityTitle.trim(),
      customer: addOppForm.customerName,
      lastActivity: '16-11-2026',
      lastActivityDays: 'Today',
      closeDate: addOppForm.closeDate || '28-11-2026',
      stage: addOppForm.stage,
      probability: Number(addOppForm.winProbability) || 10,
      rating: addOppForm.rating,
      classification: 'A - Enterprise',
      bizType: addOppForm.type,
      campaign: addOppForm.campaign,
      amount: `AED ${calculatedTotalAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      status: 'Open',
      products: addOppForm.products || []
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    toast.success(`Opportunity "${newOpp.name}" added successfully!`);
    setViewMode('list');

    // Reset form for next entry
    setAddOppForm({
      customerName: '',
      opportunityOwner: defaultOwner,
      opportunityTitle: '',
      source: 'Direct Inbound',
      sourceName: '',
      rating: 'COLD',
      closeDate: '',
      discount: '0.00',
      vatRate: '5',
      vatType: 'With VAT',
      amount: '',
      adjustment: '0.00',
      businessOpportunity: '',
      deliveryDate: '',
      lpoDate: '',
      competitorsDetails: '',
      type: 'New Business',
      location: '',
      reference: '',
      opportunityNumber: `CTEQ#${7540 + opportunities.length}`,
      leadNumber: '',
      opportunityDate: '16-11-2026',
      pointOfContact: '',
      stage: 'Enquiry',
      campaign: '',
      opportunityTags: '',
      lpoNumber: '',
      nextAction: '',
      winProbability: 10,
      comments: '',
      deliveryMethod: '',
      contactPerson: '',
      products: []
    });
  };

  const handleOpenView = (item) => {
    setViewTargetOpp(item);
    setViewMode('view');
    setActiveActionId(null);
  };

  const handleOpenEdit = (item) => {
    setEditingOppId(item.id);
    const rawAmt = String(item.amount || '1309.35').replace(/[^0-9.]/g, '');
    setAddOppForm({
      customerName: item.customer || '',
      opportunityOwner: item.owner || defaultOwner,
      opportunityTitle: item.name || '',
      source: item.source || 'Direct Inbound',
      sourceName: item.sourceName || '',
      rating: item.rating || 'COLD',
      closeDate: item.closeDate || '19-11-2026',
      discount: '0',
      vatRate: '5',
      vatType: 'With VAT',
      amount: rawAmt || '1309.35',
      adjustment: '0',
      businessOpportunity: item.bizType || '',
      deliveryDate: item.deliveryDate || '',
      lpoDate: item.lpoDate || '',
      competitorsDetails: item.competitorsDetails || '',
      type: item.type || 'New Business',
      location: item.location || 'Dubai, UAE',
      reference: item.reference || '',
      opportunityNumber: item.code || 'CTEQ#7595',
      leadNumber: item.leadNumber || 'CTLI#1005',
      opportunityDate: item.oppDate || '18-11-2026',
      pointOfContact: item.pointOfContact || 'Mr. shameem',
      stage: item.stage || 'Enquiry',
      campaign: item.campaign || '',
      opportunityTags: item.opportunityTags || '',
      lpoNumber: item.lpoNumber || '',
      nextAction: item.nextAction || '',
      winProbability: Number(item.probability ?? 10),
      comments: item.comments || '',
      deliveryMethod: item.deliveryMethod || '',
      contactPerson: item.contactPerson || 'Mr. shameem',
      products: Array.isArray(item.products) ? item.products : []
    });
    setViewMode('create');
    setActiveActionId(null);
  };

  const handleOpenAssign = (item) => {
    setAssignOppTarget(item);
    setSelectedAssignOwner(item.owner || defaultOwner);
    setIsAssignModalOpen(true);
    setActiveActionId(null);
  };

  const handleOpenCreateQuotation = (item) => {
    const quoteNo = `CTSQ#${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanAmt = String(item.amount || '1309.35').replace(/[^0-9.]/g, '') || '1309.35';
    setAddQuotationForm({
      quotationNumber: quoteNo,
      quotationDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      opportunity: `${item.code} - ${item.name} (${item.customer})`,
      quotationType: 'File Upload',
      vatType: 'With VAT',
      vatRate: '5',
      description: item.name || 'Enquiry',
      amount: cleanAmt,
      discount: '0.00',
      adjustment: '0.00',
      updateOpportunityAmount: true,
      fileName: ''
    });
    setQuotationOppTarget(item);
    setViewMode('create-quotation');
    setActiveActionId(null);
  };

  const handleAddQuotationSubmit = (e) => {
    e.preventDefault();
    const rawAmt = parseFloat(String(addQuotationForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addQuotationForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    const vatVal = addQuotationForm.vatType === 'With VAT' ? (net * (parseFloat(addQuotationForm.vatRate) || 0)) / 100 : 0;
    const adj = parseFloat(String(addQuotationForm.adjustment).replace(/,/g, '')) || 0;
    const totalVal = net + vatVal + adj;

    const newQuotation = {
      id: Date.now(),
      quotationNo: addQuotationForm.quotationNumber,
      opportunityCode: quotationOppTarget?.code || '',
      owner: quotationOppTarget?.owner || defaultOwner,
      ownerAvatarBg: quotationOppTarget?.ownerAvatarBg || 'bg-[#011635] text-white',
      date: addQuotationForm.quotationDate,
      opportunity: quotationOppTarget?.name || addQuotationForm.description || 'Enquiry',
      customer: quotationOppTarget?.customer || 'Commercial Client',
      amount: `AED ${rawAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      vat: `AED ${vatVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      total: `AED ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: 'Pending',
      type: addQuotationForm.quotationType || 'File Upload',
      products: quotationOppTarget?.products || []
    };

    try {
      const saved = JSON.parse(localStorage.getItem('alzaydan_crm_quotations') || '[]');
      const filtered = Array.isArray(saved)
        ? saved.filter((q) => q.quotationNo !== newQuotation.quotationNo && q.id !== newQuotation.id)
        : [];
      localStorage.setItem('alzaydan_crm_quotations', JSON.stringify([newQuotation, ...filtered]));
    } catch { }

    if (addQuotationForm.updateOpportunityAmount && quotationOppTarget) {
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === quotationOppTarget.id
            ? { ...o, amount: newQuotation.total, quotationNo: addQuotationForm.quotationNumber }
            : o
        )
      );
    }

    toast.success(`Quotation ${newQuotation.quotationNo} created successfully!`);
    setViewMode('list');
    setQuotationOppTarget(null);
  };

  const handleDelete = (id, name) => {
    setOpportunities((prev) => prev.filter((i) => i.id !== id));
    setActiveActionId(null);
    toast.success(`Opportunity "${name}" deleted.`);
  };

  return (
    <div className="space-y-4">
      {/* ================= TIER: ADD OPPORTUNITY FULL VIEW (Exact Match to Image 1) ================= */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Card Header: Q Add Opportunity | [+ Customer] [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Search className="w-4 h-4 text-slate-600" />
              <span>{editingOppId ? `Edit Opportunity (${addOppForm.opportunityNumber || ''})` : 'Add Opportunity'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPdfPreview({
                  ...addOppForm,
                  name: addOppForm.opportunityTitle || addOppForm.name || 'Commercial Opportunity',
                  code: addOppForm.opportunityNumber || 'CTEQ#7539',
                  customer: addOppForm.customerName || 'Commercial Client',
                  contactPerson: addOppForm.pointOfContact || 'Procurement Department',
                  oppDate: addOppForm.opportunityDate || '16-11-2026',
                  closeDate: addOppForm.closeDate || '21-11-2026',
                  owner: addOppForm.opportunityOwner || 'Super Admin',
                  amount: addOppForm.amount || productsSumTotal || '0',
                  discount: addOppForm.discount || '0',
                  vatType: addOppForm.vatType || 'With VAT',
                  vatRate: addOppForm.vat || '5',
                  adjustment: addOppForm.adjustment || '0',
                  products: addOppForm.products || []
                })}
                className="px-3 py-1.5 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                title="Preview PDF and Print Opportunity"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenQuickModal('customer')}
                className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingOppId(null);
                  setViewMode('list');
                }}
                className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Close and return to opportunity list"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          <form onSubmit={handleAddOpportunitySubmit} className="space-y-6 text-xs">
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
                      onClick={() => handleOpenQuickModal('customer')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOppForm.customerName}
                    onChange={(e) => setAddOppForm({ ...addOppForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Customer</option>
                    {addOppForm.customerName && (
                      <option value={addOppForm.customerName}>{addOppForm.customerName}</option>
                    )}
                    {allCustomers
                      .filter((c) => c.name !== addOppForm.customerName)
                      .map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. Opportunity Owner * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Opportunity Owner <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickModal('owner')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={addOppForm.opportunityOwner}
                      onChange={(e) => setAddOppForm({ ...addOppForm, opportunityOwner: e.target.value })}
                      className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={`opp-owner-${u.id || u.name}`} value={u.name}>
                          {u.name} ({u.role || u.crmProfile || 'Employee'})
                        </option>
                      ))}
                    </select>
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Opportunity Title * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Opportunity Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter opportunity or project title"
                    value={addOppForm.opportunityTitle}
                    onChange={(e) => setAddOppForm({ ...addOppForm, opportunityTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 4. Source */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Source</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <select
                    value={addOppForm.source}
                    onChange={(e) => setAddOppForm({ ...addOppForm, source: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Source</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="Referral">Referral</option>
                    <option value="Trade Exhibition">Trade Exhibition</option>
                    <option value="LinkedIn / Social">LinkedIn / Social</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Government Tender Portal">Government Tender Portal</option>
                  </select>
                </div>

                {/* 5. Rating */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Rating</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <div className="flex items-center gap-2">
                    {['COLD', 'WARM', 'HOT'].map((rate) => {
                      const isActive = addOppForm.rating === rate;
                      return (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setAddOppForm({ ...addOppForm, rating: rate })}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${isActive
                            ? 'bg-[#0070BA] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                          {rate}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Close Date * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Close Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOppForm.closeDate}
                      onChange={(e) => setAddOppForm({ ...addOppForm, closeDate: e.target.value })}
                      className="w-full px-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {addOppForm.closeDate && (
                        <button
                          type="button"
                          onClick={() => setAddOppForm({ ...addOppForm, closeDate: '' })}
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
                            try { e.target.showPicker(); } catch { }
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddOppForm({ ...addOppForm, closeDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 7. Discount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={addOppForm.discount}
                    onChange={(e) => setAddOppForm({ ...addOppForm, discount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 8. VAT (with %, rate, and calculated VAT amount) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={addOppForm.vatRate}
                        onChange={(e) => setAddOppForm({ ...addOppForm, vatRate: e.target.value })}
                        className="w-full px-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    <div className="flex-1 px-3.5 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 text-right">
                      {calculatedVatAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* 9. Total Amount (Read-only bold computed display) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Amount
                  </label>
                  <div className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-900 text-right">
                    {calculatedTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* 10. Business Opportunity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Business Opportunity
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickModal('businessOpportunity')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOppForm.businessOpportunity}
                    onChange={(e) => setAddOppForm({ ...addOppForm, businessOpportunity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Business Opportunity</option>
                    {addOppForm.businessOpportunity && !businessOppOptions.includes(addOppForm.businessOpportunity) && (
                      <option value={addOppForm.businessOpportunity}>{addOppForm.businessOpportunity}</option>
                    )}
                    {businessOppOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 11. Delivery Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Delivery Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOppForm.deliveryDate}
                      onChange={(e) => setAddOppForm({ ...addOppForm, deliveryDate: e.target.value })}
                      className="w-full px-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {addOppForm.deliveryDate && (
                        <button
                          type="button"
                          onClick={() => setAddOppForm({ ...addOppForm, deliveryDate: '' })}
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
                            try { e.target.showPicker(); } catch { }
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddOppForm({ ...addOppForm, deliveryDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 12. LPO Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOppForm.lpoDate}
                      onChange={(e) => setAddOppForm({ ...addOppForm, lpoDate: e.target.value })}
                      className="w-full px-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {addOppForm.lpoDate && (
                        <button
                          type="button"
                          onClick={() => setAddOppForm({ ...addOppForm, lpoDate: '' })}
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
                            try { e.target.showPicker(); } catch { }
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddOppForm({ ...addOppForm, lpoDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 13. Competitors Details */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Competitors Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter competitor brands, pricing notes or technical comparisons..."
                    value={addOppForm.competitorsDetails}
                    onChange={(e) => setAddOppForm({ ...addOppForm, competitorsDetails: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] resize-none"
                  />
                </div>

                {/* 14. Type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Type
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickModal('type')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOppForm.type}
                    onChange={(e) => setAddOppForm({ ...addOppForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Type</option>
                    {addOppForm.type && !oppTypeOptions.includes(addOppForm.type) && (
                      <option value={addOppForm.type}>{addOppForm.type}</option>
                    )}
                    {oppTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 15. Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search location"
                      value={addOppForm.location}
                      onChange={(e) => setAddOppForm({ ...addOppForm, location: e.target.value })}
                      className="w-full px-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 16. Reference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference code or PO tender ref"
                    value={addOppForm.reference}
                    onChange={(e) => setAddOppForm({ ...addOppForm, reference: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Opportunity Number * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Opportunity Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addOppForm.opportunityNumber}
                      onChange={(e) => setAddOppForm({ ...addOppForm, opportunityNumber: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Opportunity Serial Sequence locked: CTEQ# / AZ-OPP#')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Sequence Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Lead Number * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Lead Number <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickModal('lead')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={addOppForm.leadNumber}
                    onChange={(e) => handleLeadSelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Lead (Optional)</option>
                    <option value="Direct Opportunity (No Lead)">Direct Opportunity (No Lead)</option>
                    {addOppForm.leadNumber && !availableLeads.some(l => (l.leadCode || l.codeNum || String(l.id)) === addOppForm.leadNumber) && (
                      <option value={addOppForm.leadNumber}>{addOppForm.leadNumber}</option>
                    )}
                    {availableLeads.map((l) => {
                      const code = l.leadCode || l.codeNum || String(l.id);
                      let displayTitle = l.customerName || l.company || l.name || 'Lead';
                      if (displayTitle === 'New Enterprise Client') {
                        displayTitle = l.contactName || l.name || 'Lead';
                      }
                      const contact = l.contactName || (l.name && l.name !== displayTitle ? l.name : '');
                      const contactSuffix = contact && contact.toLowerCase() !== displayTitle.toLowerCase() ? ` (${contact})` : '';
                      return (
                        <option key={`lead-opt-${l.id || code}`} value={code}>
                          {code} - {displayTitle}{contactSuffix}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 3. Opportunity Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Opportunity Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={addOppForm.opportunityDate}
                      onChange={(e) => setAddOppForm({ ...addOppForm, opportunityDate: e.target.value })}
                      className="w-full px-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      {addOppForm.opportunityDate && (
                        <button
                          type="button"
                          onClick={() => setAddOppForm({ ...addOppForm, opportunityDate: '' })}
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
                            try { e.target.showPicker(); } catch { }
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddOppForm({ ...addOppForm, opportunityDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Point of Contact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Point of Contact
                  </label>
                  <select
                    value={addOppForm.pointOfContact}
                    onChange={(e) => setAddOppForm({ ...addOppForm, pointOfContact: e.target.value, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Point of Contact</option>
                    {addOppForm.pointOfContact && (
                      <option value={addOppForm.pointOfContact}>{addOppForm.pointOfContact}</option>
                    )}
                    <option value="Primary Contact">Primary Contact</option>
                    <option value="Procurement Department">Procurement Department</option>
                    <option value="General Inquiries">General Inquiries</option>
                  </select>
                </div>

                {/* 5. Source Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={addOppForm.sourceName}
                    onChange={(e) => setAddOppForm({ ...addOppForm, sourceName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 6. Stage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Stage
                  </label>
                  <select
                    value={addOppForm.stage}
                    onChange={(e) => setAddOppForm({ ...addOppForm, stage: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="Enquiry">Enquiry</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

                {/* 7. Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={addOppForm.amount}
                    onChange={(e) => setAddOppForm({ ...addOppForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 8. VAT Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT Type
                  </label>
                  <select
                    value={addOppForm.vatType}
                    onChange={(e) => setAddOppForm({ ...addOppForm, vatType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="With VAT">With VAT</option>
                    <option value="Without VAT">Without VAT</option>
                    <option value="Zero Rated">Zero Rated (0%)</option>
                    <option value="Exempt">Exempt</option>
                  </select>
                </div>

                {/* 9. Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adjustment
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={addOppForm.adjustment}
                    onChange={(e) => setAddOppForm({ ...addOppForm, adjustment: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 10. Campaign */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Campaign</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <select
                    value={addOppForm.campaign}
                    onChange={(e) => setAddOppForm({ ...addOppForm, campaign: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Campaign</option>
                    <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                    <option value="Freezone Commercial Outreach">Freezone Commercial Outreach</option>
                    <option value="HVAC Retrofit Drive 2026">HVAC Retrofit Drive 2026</option>
                    <option value="Digital Direct Inbound">Digital Direct Inbound</option>
                  </select>
                </div>

                {/* 11. Opportunity Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Opportunity Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Keywords attached to the opportunity"
                    value={addOppForm.opportunityTags}
                    onChange={(e) => setAddOppForm({ ...addOppForm, opportunityTags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 12. LPO Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter LPO Number"
                    value={addOppForm.lpoNumber}
                    onChange={(e) => setAddOppForm({ ...addOppForm, lpoNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 13. Next Action */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Next Action
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detail immediate follow-up or commercial milestone..."
                    value={addOppForm.nextAction}
                    onChange={(e) => setAddOppForm({ ...addOppForm, nextAction: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] resize-none"
                  />
                </div>

                {/* 14. Win Probability */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Win Probability
                    </label>
                    <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-bold text-[11px]">
                      {addOppForm.winProbability}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={addOppForm.winProbability}
                    onChange={(e) => setAddOppForm({ ...addOppForm, winProbability: Number(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* 15. Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Comments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter comments..."
                    value={addOppForm.comments}
                    onChange={(e) => setAddOppForm({ ...addOppForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] resize-none"
                  />
                </div>

                {/* 16. Delivery Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Delivery Method
                  </label>
                  <input
                    type="text"
                    placeholder="Enter delivery method (e.g. Ex-Works, Site Delivery UAE)"
                    value={addOppForm.deliveryMethod}
                    onChange={(e) => setAddOppForm({ ...addOppForm, deliveryMethod: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 17. Contact Person */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Enter contact person name"
                    value={addOppForm.contactPerson}
                    onChange={(e) => setAddOppForm({ ...addOppForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>
              </div>
            </div>

            {/* ================= PRODUCT / ITEM DETAILS SECTION ================= */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Product / Item Details</h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({(addOppForm.products || []).length} {(addOppForm.products || []).length === 1 ? 'item' : 'items'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddProductRow}
                  className="px-3 py-1.5 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Add Product</span>
                </button>
              </div>

              {(addOppForm.products || []).length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/60">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No products added yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &ldquo;+ Add Product&rdquo; to add line items with Item Name, Code, Brand, Quantity, and Price.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Add Product</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center">#</th>
                          <th className="py-2.5 px-3 min-w-[240px]">Item Name & Description <span className="text-rose-500">*</span></th>
                          <th className="py-2.5 px-3 min-w-[120px]">Item Code</th>
                          <th className="py-2.5 px-3 min-w-[120px]">Brand</th>
                          <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-32 text-right">Unit Price (AED)</th>
                          <th className="py-2.5 px-3 w-32 text-right">Total (AED)</th>
                          <th className="py-2.5 px-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {addOppForm.products.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] font-bold">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Enter item name..."
                                value={item.itemName}
                                onChange={(e) => handleUpdateProductRow(item.id, 'itemName', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                              />
                              <input
                                type="text"
                                placeholder="Technical description / specs (optional)..."
                                value={item.description || ''}
                                onChange={(e) => handleUpdateProductRow(item.id, 'description', e.target.value)}
                                className="w-full mt-1 px-2.5 py-1 bg-white border border-dashed border-slate-300 rounded-md text-[11px] text-slate-600 outline-none focus:border-[#16477A]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Code / SKU"
                                value={item.itemCode}
                                onChange={(e) => handleUpdateProductRow(item.id, 'itemCode', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Brand"
                                value={item.brand}
                                onChange={(e) => handleUpdateProductRow(item.id, 'brand', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateProductRow(item.id, 'quantity', e.target.value)}
                                className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={item.price}
                                onChange={(e) => handleUpdateProductRow(item.id, 'price', e.target.value)}
                                className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-mono text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {(parseFloat(item.total) || 0).toLocaleString('en-US', {
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

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAddProductRow}
                      className="text-xs font-bold text-[#00607A] hover:text-[#004e63] flex items-center gap-1 cursor-pointer transition self-start"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Product</span>
                    </button>

                    <div className="flex items-center gap-4 text-xs bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs self-end">
                      <span className="text-slate-500 font-medium">Total Products Amount:</span>
                      <span className="font-mono font-extrabold text-blue-700 text-sm">
                        AED {productsSumTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Row: [Print / PDF], [Submit] and [← Back] */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleOpenPdfPreview({
                  ...addOppForm,
                  name: addOppForm.opportunityTitle || addOppForm.name || 'Commercial Opportunity',
                  code: addOppForm.opportunityNumber || 'CTEQ#7539',
                  customer: addOppForm.customerName || 'Commercial Client',
                  contactPerson: addOppForm.pointOfContact || 'Procurement Department',
                  oppDate: addOppForm.opportunityDate || '16-11-2026',
                  closeDate: addOppForm.closeDate || '21-11-2026',
                  owner: addOppForm.opportunityOwner || 'Super Admin',
                  amount: addOppForm.amount || productsSumTotal || '0',
                  discount: addOppForm.discount || '0',
                  vatType: addOppForm.vatType || 'With VAT',
                  vatRate: addOppForm.vat || '5',
                  adjustment: addOppForm.adjustment || '0',
                  products: addOppForm.products || []
                })}
                className="px-4 py-2 bg-[#16477A] hover:bg-[#0f345a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Preview PDF and Print Opportunity"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
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
                  setEditingOppId(null);
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
      {/* TIER: VIEW OPPORTUNITY (Exact Match to Image 1)               */}
      {/* ============================================================== */}
      {viewMode === 'view' && viewTargetOpp && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden animate-in fade-in duration-150 space-y-0">
          {/* Header Title Bar: ↗ CTEQ#7595 / ENQUIRY | Red [X] */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="font-mono uppercase tracking-wide">
                {viewTargetOpp.code} / {viewTargetOpp.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPdfPreview(viewTargetOpp)}
                className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                title="Preview PDF and Print Opportunity"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="w-6 h-6 rounded bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition shadow-xs"
                title="Close and return to list"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Sub-tab Ribbon (10 Tabs matching Image 1) */}
          <div className="bg-slate-50/60 border-b border-slate-200/80 px-4 flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'Opportunity', label: 'Opportunity', icon: Layers },
              { id: 'Enquiry Form', label: 'Enquiry Form', icon: FileText },
              { id: 'Customer', label: 'Customer', icon: User },
              { id: 'Contact Details', label: 'Contact Details', icon: UserCheck },
              { id: 'Cost Details', label: '$ Cost Details / Jobs', icon: null },
              { id: 'Commercial Offer', label: 'Commercial Offer', icon: FileText },
              { id: 'Proforma Invoice', label: 'Proforma Invoice', icon: FileText },
              { id: 'Invoice', label: 'Invoice', icon: FileText },
              { id: 'Purchase', label: 'Purchase', icon: ShoppingCart },
              { id: 'History', label: 'History', icon: Clock }
            ].map((tab) => {
              const isActive = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${isActive
                    ? 'border-rose-600 text-rose-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Centered Headline matching Image 1 */}
          <div className="text-center py-5 space-y-1 bg-white border-b border-slate-100">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              {viewTargetOpp.name || 'ENQUIRY'}
            </h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {viewTargetOpp.customer || 'MUSSAFAH INDUSTRIAL AREA, ABU DHABI'}
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-rose-500 font-mono font-bold pt-0.5">
              <span>///</span>
              <span>MIA AD</span>
            </div>
          </div>

          {/* Chevron Pipeline Stages (Clickable to change stage) */}
          <div className="p-4 sm:p-5 bg-white border-b border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-4xl mx-auto">
              {[
                { label: 'Enquiry', days: '0 day(s)' },
                { label: 'Qualification', days: '0 day(s)' },
                { label: 'Offer Sent', days: '0 day(s)' },
                { label: 'Negotiation', days: '0 day(s)' },
                { label: 'Won', days: '0 day(s)' }
              ].map((stage) => {
                const isActive = (viewTargetOpp.stage || 'Enquiry').toLowerCase().includes(stage.label.toLowerCase());
                return (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => handleUpdateStage(viewTargetOpp.id, stage.label)}
                    className={`relative py-2.5 px-3 text-center text-xs font-bold transition-all rounded-lg shadow-2xs cursor-pointer ${isActive
                      ? 'bg-[#0087D1] text-white ring-2 ring-blue-300 ring-offset-1 scale-[1.02]'
                      : 'bg-[#8FA3B7] hover:bg-slate-500 text-white/90'
                      }`}
                    title={`Click to set stage to ${stage.label}`}
                  >
                    <div className="leading-tight">{stage.label}</div>
                    <div className="text-[10px] font-normal opacity-90 mt-0.5">{stage.days}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Responsive Body */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40">
            {/* LEFT COLUMN: Opportunity Details */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-3 border-b border-slate-100">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Opportunity Details</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Opportunity Owner</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {(viewTargetOpp.owner || 'T')[0]?.toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-800 uppercase">{viewTargetOpp.owner}</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Opportunity Number</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-800 font-mono">{viewTargetOpp.code}</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Lead Number</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono text-[11px] font-bold flex items-center gap-1">
                    CTLI#1005 <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Quotation Number</span>
                  <span className="font-mono font-bold text-blue-600 text-[11px]">{viewTargetOpp.quotationNo || 'CTSQ#4438'}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Opportunity Title</span>
                  <span className="font-bold text-slate-800 uppercase">{viewTargetOpp.name}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium shrink-0">Customer</span>
                  <span className="font-bold text-blue-600 uppercase flex items-center gap-1 text-right truncate">
                    {viewTargetOpp.customer} <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Rating</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1D68F2] text-white uppercase">
                    {viewTargetOpp.rating || 'COLD'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Stage</span>
                  <div className="relative inline-block text-left" data-stage-dropdown>
                    <button
                      type="button"
                      onClick={() => setDetailStageDropdownOpen(!detailStageDropdownOpen)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:opacity-90 ${(STAGE_CONFIG.find((s) => s.label.toLowerCase() === (viewTargetOpp.stage || '').toLowerCase())?.color) || 'bg-[#1D68F2] text-white'
                        }`}
                      title="Click to change Opportunity Stage"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>{viewTargetOpp.stage || 'Enquiry'}</span>
                      <ChevronDown className="w-3 h-3 opacity-80" />
                    </button>

                    {detailStageDropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                          Select Stage
                        </div>
                        {STAGE_CONFIG.map((stg) => {
                          const isSelected = (viewTargetOpp.stage || 'Enquiry').toLowerCase() === stg.label.toLowerCase();
                          return (
                            <button
                              key={stg.label}
                              type="button"
                              onClick={() => {
                                handleUpdateStage(viewTargetOpp.id, stg.label);
                                setDetailStageDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-slate-50 transition cursor-pointer font-medium ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{stg.icon}</span>
                                <span>{stg.label}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 font-bold">
                                {stg.probability}%
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Opportunity Date</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <span>{viewTargetOpp.oppDate}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-sans">Today</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Created</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                    <span>T {viewTargetOpp.oppDate} 10:00:00 AM</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-sans">Today</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Modified</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                    <span>T {viewTargetOpp.oppDate} 12:00:00 PM</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-sans">Today</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Activity</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                    <span>T {viewTargetOpp.oppDate} 12:00:00 PM</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-sans">Today</span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Close Date</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <span>{viewTargetOpp.closeDate}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-sans">7 days</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Print/PDF, Convert, Assign, Edit, Delete) matching Image 1 */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview(viewTargetOpp)}
                  className="px-3.5 py-2 rounded-lg bg-[#011635] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#07244a] transition cursor-pointer shadow-2xs"
                  title="Print or Export Opportunity as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Convert to Multiple Opportunity initiated')}
                  className="px-3.5 py-2 rounded-lg bg-[#011635] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#07244a] transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Convert to Multiple Opportunity</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAssign(viewTargetOpp)}
                  className="px-3.5 py-2 rounded-lg bg-[#011635] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#07244a] transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Assign Opportunity</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(viewTargetOpp)}
                  className="px-3.5 py-2 rounded-lg bg-[#1D68F2] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(viewTargetOpp.id, viewTargetOpp.name);
                    setViewMode('list');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#EF4444] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-red-600 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Overview & Cost Details matching Image 1 */}
            <div className="lg:col-span-7 space-y-6">
              {/* Overview Card: Simple & Clean (Actual Price | VAT | Total Amount) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Overview</span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">5% UAE VAT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  {/* Actual Price */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Actual Price</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                        AED {oppFinancials.actualPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      AED
                    </div>
                  </div>

                  {/* VAT (5%) */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">VAT (5%)</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                        AED {oppFinancials.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-blue-800 font-bold block">Total Amount</span>
                      <span className="text-base font-extrabold text-blue-700 mt-1 block font-mono">
                        AED {oppFinancials.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      $
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                  Cost Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Estimated Cost</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">0.00</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Actual Cost</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">0.00</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Estimated Profit(GP)</span>
                    <span className="text-sm font-bold text-blue-600 mt-0.5 block font-mono">
                      AED {oppFinancials.actualPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product / Item Details Card */}
              {viewTargetOpp.products && viewTargetOpp.products.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Products / Items Details</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {viewTargetOpp.products.length} {viewTargetOpp.products.length === 1 ? 'item' : 'items'}
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
                        {viewTargetOpp.products.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{p.itemName || '—'}</div>
                              {(p.description || p.itemCode) && (
                                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  {p.description || `Technical spec code: ${p.itemCode}`}
                                </div>
                              )}
                            </td>
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
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Opportunity Activities */}
          <div className="p-5 sm:p-6 bg-white border-t border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Opportunity Activities</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs">
                {['Notes', 'Task', 'Files', 'Sales Visit'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveActivityTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeActivityTab === tab
                      ? 'bg-slate-100 text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => toast.info(`Add ${activeActivityTab} modal opened`)}
                className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add</span>
              </button>
            </div>

            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              No Notes.
            </div>
          </div>

          {/* Footer Bar: [ ← Back ] */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-bold transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TIER: ADD QUOTATION VIEW (Exact Match to Image 4)             */}
      {/* ============================================================== */}
      {viewMode === 'create-quotation' && quotationOppTarget && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Header: 📄 Add Quotation | Red [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Add Quotation</span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
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
                      onClick={() => toast.info('Sequence Settings')}
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
                      onClick={() => setViewMode('create')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    required
                    value={addQuotationForm.opportunity}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, opportunity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value={addQuotationForm.opportunity}>{addQuotationForm.opportunity}</option>
                    {opportunities.map((opp) => (
                      <option key={`quote-opp-${opp.id || opp.code}`} value={`${opp.code} - ${opp.name} (${opp.customer})`}>
                        {opp.code} - {opp.name} ({opp.customer})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. File */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    File
                  </label>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <input
                      type="file"
                      id="quotation-file-input"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAddQuotationForm({ ...addQuotationForm, fileName: e.target.files[0].name });
                        }
                      }}
                    />
                    <label
                      htmlFor="quotation-file-input"
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer transition"
                    >
                      Choose file
                    </label>
                    <span className="text-slate-500 text-xs truncate max-w-[200px]">
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
                    value={addQuotationForm.amount}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 5. VAT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    VAT
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 w-28">
                      <input
                        type="text"
                        value={addQuotationForm.vatRate}
                        onChange={(e) => setAddQuotationForm({ ...addQuotationForm, vatRate: e.target.value })}
                        className="w-full bg-transparent text-xs text-slate-800 outline-none font-bold"
                      />
                      <span className="text-slate-400 font-bold ml-1">%</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={quoteCalculatedVat.toFixed(2)}
                      className="flex-1 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 outline-none"
                    />
                  </div>
                </div>

                {/* 6. Total Amount */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Total Amount</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    {quoteCalculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
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
                      placeholder="dd-mm-yyyy"
                      value={addQuotationForm.quotationDate}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, quotationDate: e.target.value })}
                      className="w-full px-3.5 py-2 pr-16 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
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
                            try { e.target.showPicker(); } catch { }
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

                {/* 2. Quotation Type * & VAT Type */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Quotation Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={addQuotationForm.quotationType}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, quotationType: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="File Upload">File Upload</option>
                      <option value="Itemized">Itemized</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      VAT Type
                    </label>
                    <select
                      value={addQuotationForm.vatType}
                      onChange={(e) => setAddQuotationForm({ ...addQuotationForm, vatType: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Zero VAT">Zero VAT</option>
                    </select>
                  </div>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={addQuotationForm.description}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, description: e.target.value })}
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
                    value={addQuotationForm.discount}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, discount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 5. Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adjustment
                  </label>
                  <input
                    type="text"
                    value={addQuotationForm.adjustment}
                    onChange={(e) => setAddQuotationForm({ ...addQuotationForm, adjustment: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={addQuotationForm.updateOpportunityAmount}
                  onChange={(e) => setAddQuotationForm({ ...addQuotationForm, updateOpportunityAmount: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-0 cursor-pointer w-4 h-4 accent-rose-600"
                />
                <span>Update quotation amount in opportunity</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= TIER: OPPORTUNITY LIST VIEW ================= */}
      {viewMode === 'list' && (
        <>
          {/* ============================================================== */}
          {/* 1. TOP HORIZONTAL PILL BUTTONS (Matching Image 1 Exactly)      */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'All', label: 'All', icon: Search, count: opportunities.length },
              { id: 'Unread', label: 'Unread', icon: Clock, count: 0 },
              { id: 'Open', label: 'Open', icon: Star, count: opportunities.filter((o) => o.status === 'Open').length, isStar: true },
              { id: 'Today', label: 'Today', icon: Clock, count: 0 },
              { id: 'Overdue', label: 'Overdue', icon: Clock, count: 0 },
              { id: 'Upcoming', label: 'Upcoming', icon: Calendar, count: 0 },
              { id: 'Lost', label: 'Lost', icon: X, count: 0 },
              { id: 'Order', label: 'Order', icon: ShoppingCart, count: 0 },
              { id: 'Overview', label: 'Overview', icon: Layers, noCount: true }
            ].map((pill) => {
              const Icon = pill.icon;
              const isActive = activePill === pill.id;

              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setActivePill(pill.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isActive
                    ? pill.isStar
                      ? 'border-2 border-rose-500 text-rose-600 bg-rose-50/30 shadow-xs'
                      : 'bg-[#011635] text-white shadow-xs'
                    : 'border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive
                      ? pill.isStar
                        ? 'text-rose-500 fill-rose-500'
                        : 'text-white'
                      : 'text-slate-400'
                      }`}
                  />
                  <span>{pill.label}</span>
                  {!pill.noCount && (
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${isActive
                        ? pill.isStar
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-white/20 text-white'
                        : 'text-slate-400'
                        }`}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* 2. SPLIT LAYOUT: LEFT FILTER CRITERIA | RIGHT OPPORTUNITIES     */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT COLUMN: FILTER CRITERIA CARD (Matching Image 1) */}
            {showFilterSidebar && (
              <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5 animate-in fade-in slide-in-from-left-2 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      Filter Criteria
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFilterSidebar(false);
                      toast.info('Filter panel collapsed');
                    }}
                    className="text-rose-500 hover:text-rose-700 transition cursor-pointer p-0.5 rounded-md hover:bg-rose-50"
                    title="Close Filter Criteria"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Customer / Prospect */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Customer/ Prospect
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Customer/Prospect"
                        value={filterCustomer}
                        onChange={(e) => {
                          setFilterCustomer(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Classification
                    </label>
                    <select
                      value={filterClassification}
                      onChange={(e) => {
                        setFilterClassification(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="All Classification">All Classification</option>
                      <option value="A - Enterprise">A - Enterprise</option>
                      <option value="B - Mid-Market">B - Mid-Market</option>
                      <option value="C - Standard">C - Standard</option>
                    </select>
                  </div>

                  {/* Stage */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Stage
                    </label>
                    <select
                      value={filterStage}
                      onChange={(e) => {
                        setFilterStage(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="All Stages">All Stages</option>
                      {STAGE_CONFIG.map((stg) => (
                        <option key={stg.label} value={stg.label}>
                          {stg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Rating
                    </label>
                    <select
                      value={filterRating}
                      onChange={(e) => {
                        setFilterRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="HOT">HOT</option>
                      <option value="WARM">WARM</option>
                      <option value="COLD">COLD</option>
                    </select>
                  </div>

                  {/* Business Opportunity */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Business Opportunity
                    </label>
                    <select
                      value={filterBizType}
                      onChange={(e) => {
                        setFilterBizType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="Select Type">Select Type</option>
                      <option value="New Business">New Business</option>
                      <option value="Renewal">Renewal</option>
                      <option value="Expansion">Expansion</option>
                    </select>
                  </div>

                  {/* Opportunity Owner */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Opportunity Owner
                    </label>
                    <select
                      value={filterOwner}
                      onChange={(e) => {
                        setFilterOwner(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="All Owners">All Owners</option>
                      {ownerOptions.map((owner) => (
                        <option key={owner} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campaign */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Campaign
                    </label>
                    <select
                      value={filterCampaign}
                      onChange={(e) => {
                        setFilterCampaign(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="Select Campaign">Select Campaign</option>
                      <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                      <option value="JAFZA Outreach">JAFZA Outreach</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>

                  {/* Created By */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Created By
                    </label>
                    <select
                      value={filterCreatedBy}
                      onChange={(e) => setFilterCreatedBy(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Sales Manager">Sales Manager</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Select tags"
                      value={filterTags}
                      onChange={(e) => setFilterTags(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800"
                    />
                  </div>

                  {/* Reset Filters Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: OPPORTUNITIES TABLE CONTAINER */}
            <div
              className={`${showFilterSidebar ? 'lg:col-span-9' : 'lg:col-span-12'
                } bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all duration-200`}
            >
              {/* Section Header: [⭐ Open Opportunities] + Actions */}
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${showFilterSidebar
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
                      }`}
                    title={showFilterSidebar ? 'Hide Filters' : 'Show Filters'}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Filter</span>
                  </button>

                  <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                  <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    {activePill === 'Open' ? 'Open Opportunities' : `${activePill} Opportunities`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Opportunity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Opportunity</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddOpportunity}
                    className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ + OPPORTUNITY</span>
                  </button>
                </div>
              </div>

              {/* Sub-bar: Shows [10 ▾] Rows & Search Opportunity */}
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
                    placeholder="Search Opportunity"
                    className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Table: Exact Columns matching Image 1 */}
              <div className="overflow-x-auto min-h-[420px] pb-24">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={pagedList.length > 0 && selectedIds.length === pagedList.length}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-2">SL.No</th>
                      <th className="py-3 px-3">Owner</th>
                      <th className="py-3 px-3">Opportunity Date</th>
                      <th className="py-3 px-3">Opportunity Assigned</th>
                      <th className="py-3 px-3">Opportunity</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Last Activity</th>
                      <th className="py-3 px-3">Close Date</th>
                      <th className="py-3 px-3">Stage & Win Probability</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-20 text-center text-slate-400 font-medium text-xs">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Star className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                            <span>No opportunities found matching the selected filters.</span>
                            <span className="text-[11px] text-slate-400">
                              Click "+ + OPPORTUNITY" to create a new commercial pipeline opportunity.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pagedList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleToggleSelect(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-400 font-bold text-[11px]">
                            {String((currentPage - 1) * rowsPerPage + idx + 1).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${item.ownerAvatarBg || 'bg-[#011635] text-white'}`}>
                                {(item.owner || 'A')[0]}
                              </div>
                              <span className="font-semibold text-slate-700 text-xs">
                                {item.owner || 'Al Zaydan'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {item.oppDate}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {item.assignedDate}
                          </td>
                          <td className="py-3 px-3">
                            <div
                              onClick={() => handleOpenView(item)}
                              className="font-bold text-blue-600 text-xs hover:underline cursor-pointer"
                            >
                              {item.name || 'Commercial Opportunity'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.code || 'OPP-0000'} &bull; {item.bizType || 'New Business'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 text-xs">
                              {item.customer || 'Enterprise Customer'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-slate-600 font-mono text-[11px]">
                              {item.lastActivity || '16-11-2026'}
                            </div>
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">
                              {item.lastActivityDays || 'Today'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {item.closeDate || '28-11-2026'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col items-start gap-1">
                              {/* Clickable Stage Pill with Dropdown */}
                              <div className="relative inline-block text-left" data-stage-dropdown>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveStageDropdownId(activeStageDropdownId === item.id ? null : item.id);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs hover:opacity-90 transition-all cursor-pointer ${(STAGE_CONFIG.find((s) => s.label.toLowerCase() === (item.stage || '').toLowerCase())?.color) || 'bg-[#1D68F2] text-white'
                                    }`}
                                  title="Click to change Opportunity Stage"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{item.stage || 'Enquiry'}</span>
                                  <ChevronDown className="w-3 h-3 opacity-80" />
                                </button>

                                {/* Dropdown Menu to change stage */}
                                {activeStageDropdownId === item.id && (
                                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                      Change Stage
                                    </div>
                                    {STAGE_CONFIG.map((stg) => {
                                      const isSelected = (item.stage || 'Enquiry').toLowerCase() === stg.label.toLowerCase();
                                      return (
                                        <button
                                          key={stg.label}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStage(item.id, stg.label);
                                            setActiveStageDropdownId(null);
                                          }}
                                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-slate-50 transition cursor-pointer font-medium ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                                            }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs">{stg.icon}</span>
                                            <span>{stg.label}</span>
                                          </div>
                                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                                            {stg.probability}%
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Probability Bar */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${(STAGE_CONFIG.find((s) => s.label.toLowerCase() === (item.stage || '').toLowerCase())?.barColor) || 'bg-amber-500'
                                      }`}
                                    style={{ width: `${Math.max(8, Math.min(100, item.probability ?? 10))}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 font-mono">
                                  {item.probability ?? 10}%
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 text-sm font-sans">
                            {item.amount?.replace(/AED\s?|\$/g, '') || '0.00'}
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
                                    onClick={() => {
                                      handleOpenPdfPreview(item);
                                      setActiveActionId(null);
                                    }}
                                    className="w-full px-3 py-2 text-[13px] text-[#011635] hover:bg-slate-50 rounded-lg flex items-center gap-3 font-semibold transition cursor-pointer"
                                  >
                                    <Printer className="w-4 h-4 text-[#16477A] stroke-[1.8]" />
                                    <span>Print / PDF</span>
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
                                    onClick={() => handleOpenCreateQuotation(item)}
                                    className="w-full px-3 py-2 text-[13px] text-[#2563EB] hover:bg-blue-50/70 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4 text-[#2563EB] stroke-[1.8]" />
                                    <span>Create Quotation</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenAssign(item)}
                                    className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4 text-slate-600 stroke-[1.8]" />
                                    <span>Assign Opportunity</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDelete(item.id, item.name);
                                      setActiveActionId(null);
                                    }}
                                    className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 text-slate-600 stroke-[1.8]" />
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

              {/* Table Footer: Showing 0 to N entries + Pagination */}
              <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <div>
                  Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, filteredList.length)} of {filteredList.length} entries (Total: {opportunities.length})
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${currentPage === pg
                        ? 'bg-[#0055D4] text-white shadow-xs'
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
            </div>
          </div>
        </>
      )
      }

      {/* ================= MODAL: + + OPPORTUNITY ================= */}
      {
        isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    New Commercial Opportunity
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Opportunity Title / Deal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Freezone Cold Storage Maintenance 2027"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Customer Account *
                    </label>
                    <select
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={`legacy-cust-${c.name}`} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Opportunity Owner *
                    </label>
                    <select
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                    >
                      {ownerOptions.map((owner) => (
                        <option key={`form-owner-${owner}`} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Est. Deal Value (AED) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="180,000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                    >
                      <option value="Discovery">Discovery</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Win Prob. (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Campaign Source
                    </label>
                    <select
                      value={formData.campaign}
                      onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                    >
                      <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                      <option value="JAFZA Outreach">JAFZA Outreach</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold transition shadow-xs cursor-pointer"
                  >
                    Create Opportunity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ================= MODAL: ASSIGN OPPORTUNITY (Exact Match to Image 3) ================= */}
      {
        isAssignModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
              {/* Header: Assign Opportunity | [X] */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  Assign Opportunity
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setAssignOppTarget(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Assign To on left, User Dropdown on right */}
              <div className="py-2">
                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-xs font-semibold text-slate-800">
                    Assign To
                  </label>
                  <div className="col-span-9 relative">
                    <div className="flex items-center gap-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {(selectedAssignOwner || 'M')[0]?.toUpperCase()}
                      </div>
                      <select
                        value={selectedAssignOwner}
                        onChange={(e) => setSelectedAssignOwner(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none pr-6"
                      >
                        {availableUsers.map((u) => (
                          <option key={`assign-opp-${u.id || u.name}`} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons: Close | Update (Green) */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setAssignOppTarget(null);
                  }}
                  className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (assignOppTarget) {
                      setOpportunities((prev) =>
                        prev.map((o) =>
                          o.id === assignOppTarget.id
                            ? { ...o, owner: selectedAssignOwner, opportunityOwner: selectedAssignOwner, salesRep: selectedAssignOwner }
                            : o
                        )
                      );
                      if (viewTargetOpp && viewTargetOpp.id === assignOppTarget.id) {
                        setViewTargetOpp((prev) => ({
                          ...prev,
                          owner: selectedAssignOwner,
                          opportunityOwner: selectedAssignOwner,
                          salesRep: selectedAssignOwner
                        }));
                      }
                      toast.success(`Opportunity "${assignOppTarget.name}" assigned to ${selectedAssignOwner}!`);
                    } else {
                      toast.success('Opportunity reassignments saved successfully.');
                    }
                    setIsAssignModalOpen(false);
                    setAssignOppTarget(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ================= MODAL: UPLOAD OPPORTUNITY ================= */}
      {
        isUploadModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Bulk Upload Opportunities
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

              <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center transition cursor-pointer bg-slate-50/50">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">
                  Click or drag CSV/Excel spreadsheet to upload
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supported columns: Title, Customer, Value, Stage, Win%, Close Date
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
                    toast.success('Sample opportunities imported successfully!');
                    setIsUploadModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ================= MODAL: QUICK ADD OPTION (+ NEW) ================= */}
      {
        quickAddModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {quickAddModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false })}
                  className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickModal} className="space-y-4 text-xs">
                {/* Primary Name Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {quickAddModal.type === 'customer'
                      ? 'Customer / Company Name *'
                      : quickAddModal.type === 'lead'
                        ? 'Lead / Project Title *'
                        : quickAddModal.type === 'owner'
                          ? 'Owner Full Name *'
                          : quickAddModal.type === 'businessOpportunity'
                            ? 'Business Opportunity Name *'
                            : 'Type Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={quickAddModal.name}
                    onChange={(e) => setQuickAddModal({ ...quickAddModal, name: e.target.value })}
                    placeholder={
                      quickAddModal.type === 'customer'
                        ? 'e.g. Al Habtoor Engineering LLC'
                        : quickAddModal.type === 'lead'
                          ? 'e.g. Dubai Marina Tower HVAC Inquiry'
                          : quickAddModal.type === 'owner'
                            ? 'e.g. Muhammed Shibil'
                            : quickAddModal.type === 'businessOpportunity'
                              ? 'e.g. Industrial Chillers Supply & Overhaul'
                              : 'e.g. Commercial Retrofit'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* Extra Field 1: Contact Person / Designation */}
                {(quickAddModal.type === 'customer' || quickAddModal.type === 'lead' || quickAddModal.type === 'owner') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {quickAddModal.type === 'owner' ? 'Designation / Role' : 'Contact Person (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={quickAddModal.extra1}
                      onChange={(e) => setQuickAddModal({ ...quickAddModal, extra1: e.target.value })}
                      placeholder={quickAddModal.type === 'owner' ? 'Sales Executive' : 'e.g. Eng. Tariq Mansoor'}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>
                )}

                {/* Extra Field 2: Phone */}
                {(quickAddModal.type === 'customer' || quickAddModal.type === 'lead') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone / Mobile (Optional)
                    </label>
                    <input
                      type="text"
                      value={quickAddModal.extra2}
                      onChange={(e) => setQuickAddModal({ ...quickAddModal, extra2: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>
                )}

                {/* Extra Field 3: Email (for Customer) */}
                {quickAddModal.type === 'customer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={quickAddModal.extra3}
                      onChange={(e) => setQuickAddModal({ ...quickAddModal, extra3: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false })}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#011635] hover:bg-[#07244a] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save & Select</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ============================================================== */}
      {/* COMMERCIAL OPPORTUNITY PDF DOCUMENT PREVIEW MODAL               */}
      {/* ============================================================== */}
      <CommercialDocumentPdfModal
        isOpen={pdfPreviewModal.isOpen}
        onClose={handleClosePdfPreview}
        docType="OPPORTUNITY"
        data={pdfPreviewModal.data}
      />
    </div >
  );
}
