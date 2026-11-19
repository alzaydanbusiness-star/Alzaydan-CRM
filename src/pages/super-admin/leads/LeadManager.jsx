import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  UserCheck,
  UploadCloud,
  Settings,
  ChevronDown,
  Info,
  MapPin,
  Phone,
  Smartphone,
  Mail,
  User,
  Check,
  X,
  Trash2,
  Edit3,
  Eye,
  Building,
  Menu,
  ArrowLeft,
  UserPlus,
  Pencil,
  FileText,
  MessageCircle,
  Share2,
  Paperclip,
  Folder,
  RotateCw,
  GitBranch
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers, getLoggedInUser } from '../../../utils/userDirectory';

const UAE_LOCATIONS = [
  'Dubai, UAE',
  'Dubai - Downtown / Business Bay',
  'Dubai - Al Quoz Industrial',
  'Dubai - Jebel Ali Free Zone (JAFZA)',
  'Dubai - Dubai Silicon Oasis',
  'Dubai - Deira / Bur Dubai',
  'Abu Dhabi, UAE',
  'Abu Dhabi - Mussafah Industrial Area',
  'Abu Dhabi - Khalifa City / KIZAD',
  'Abu Dhabi - Al Reem Island / Corniche',
  'Sharjah, UAE',
  'Sharjah - Industrial Area 1-18',
  'Sharjah - SAIF Zone',
  'Ajman, UAE',
  'Ajman - Jurf Industrial Area',
  'Ras Al Khaimah - RAKEZ Industrial Zone',
  'Fujairah - Port / Freezone',
  'Umm Al Quwain'
];

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', bg: 'bg-[#EAB308]', dot: 'bg-amber-500' },
  { value: 'Contacted', label: 'Contacted', bg: 'bg-[#0284C7]', dot: 'bg-sky-500' },
  { value: 'Qualified', label: 'Qualified', bg: 'bg-[#6366F1]', dot: 'bg-indigo-500' },
  { value: 'Won', label: 'Won', bg: 'bg-[#10B981]', dot: 'bg-emerald-500' },
  { value: 'Disqualified', label: 'Disqualified', bg: 'bg-[#EF4444]', dot: 'bg-rose-500' },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-[#EAB308] text-white';
    case 'Contacted':
      return 'bg-[#0284C7] text-white';
    case 'In Progress':
      return 'bg-[#3B82F6] text-white';
    case 'Qualified':
      return 'bg-[#6366F1] text-white';
    case 'Won':
      return 'bg-[#10B981] text-white';
    case 'Disqualified':
      return 'bg-[#EF4444] text-white';
    case 'Converted':
      return 'bg-emerald-600 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
};

export default function LeadManager({
  leads = [],
  _leads = [],
  setLeads = () => {},
  employees = [],
  customers = [],
  setCustomers = () => {},
  _opportunities = [],
  setOpportunities = () => {},
  initialViewMode = 'list'
}) {
  // View mode: 'list' (Lead list table - Image 2) | 'create' (Add Lead form - Image 1)
  const [viewMode, setViewMode] = useState(initialViewMode);

  // Available current real users from directory (synchronized across CRM)
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

  const activeUser = useMemo(() => getLoggedInUser(), []);
  const defaultOwnerName = availableUsers[0]?.name || activeUser?.name || 'Super Admin';
  const defaultAssigneeName = availableUsers.find(u => u.roleTier === 'staff')?.name || availableUsers[0]?.name || 'Super Admin';

  // Form State for Add Lead (matching Image 1)
  const [addLeadForm, setAddLeadForm] = useState({
    leadOwner: defaultOwnerName,
    assignTo: defaultAssigneeName,
    contactPrefix: 'Mr.',
    contactName: '',
    businessMobilePrefix: '+971',
    businessMobile: '',
    email: '',
    customerName: '',
    website: '',
    campaign: '',
    sourceName: '',
    status: 'Pending',
    location: '',
    leadNumber: 'CTL#1002',
    leadDate: '16-11-2026',
    nationality: '',
    leadTags: '',
    source: '',
    rating: 'COLD',
    businessOpportunity: '',
    comments: ''
  });
  // 12 Filter States matching the exact reference layout
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [businessOpportunity, setBusinessOpportunity] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [inactiveFromDate, setInactiveFromDate] = useState('');
  const [leadDateFilter, setLeadDateFilter] = useState('');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [assignedDateFilter, setAssignedDateFilter] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');

  // Table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [activeStatusMenuId, setActiveStatusMenuId] = useState(null);
  const [activeRatingMenuId, setActiveRatingMenuId] = useState(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveActionMenuId(null);
      setActiveStatusMenuId(null);
      setActiveRatingMenuId(null);
    };
    if (activeActionMenuId || activeStatusMenuId || activeRatingMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeActionMenuId, activeStatusMenuId, activeRatingMenuId]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [statusRatingLead, setStatusRatingLead] = useState(null);
  const [statusRatingDraft, setStatusRatingDraft] = useState({ status: 'Pending', rating: 'COLD', comments: '', addNote: false });

  // Reassign modal state
  const [bulkAssignTarget, setBulkAssignTarget] = useState(defaultAssigneeName);

  // Active Lead for View / Edit / Convert
  const [activeLead, setActiveLead] = useState(null);
  const [activeActivityTab, setActiveActivityTab] = useState('Notes'); // 'Notes' | 'Task' | 'Files' | 'Sales Visit'
  const [leadActivities, setLeadActivities] = useState({});

  // Single Assign modal state (Image 5)
  const [singleAssignLead, setSingleAssignLead] = useState(null);
  const [singleAssignTarget, setSingleAssignTarget] = useState(defaultAssigneeName);

  // Edit Lead Form State (Image 3)
  const [editLeadForm, setEditLeadForm] = useState({
    id: null,
    leadCode: '',
    leadOwner: defaultOwnerName,
    assignTo: defaultAssigneeName,
    contactPrefix: 'Mr.',
    contactName: '',
    businessMobilePrefix: '+971',
    businessMobile: '',
    email: '',
    customerName: '',
    website: '',
    campaign: '',
    sourceName: '',
    status: 'Pending',
    location: 'Dubai, UAE',
    leadDate: '16-11-2026',
    designation: 'Select',
    personalMobilePrefix: '+971',
    personalMobile: '',
    nationality: 'Select',
    telPrefix: '+971',
    tel: '',
    leadTags: '',
    source: 'Website Inbound',
    rating: 'COLD',
    businessOpportunity: 'HVAC Installation',
    comments: ''
  });

  // Convert Lead Form State (Image 6)
  const [convertForm, setConvertForm] = useState({
    owner: defaultOwnerName,
    contactPrefix: 'Mr.',
    contactName: '',
    designation: 'Select',
    source: 'Website Inbound',
    personalMobilePrefix: '+971',
    personalMobile: '',
    businessMobilePrefix: '+971 (UAE)',
    businessMobile: '',
    address: '',
    email: '',
    stateRegion: 'Dubai',
    nationality: 'United Arab Emirates',
    spokenLanguage: 'Select',
    comments: '',
    customerName: '',
    industryType: 'Select',
    parentCustomer: 'Select',
    customerTags: '',
    sourceName: '',
    keyCustomer: 'No',
    campaign: 'SIMPLE LIFE - 2025',
    noOfEmployees: '50',
    telPrefix: '+971',
    tel: '',
    website: '',
    customerAddress: '',
    country: 'United Arab Emirates',
    location: 'Dubai, UAE',
    trn: '',
    isSupplier: false,
    addOpportunity: true,
    opportunityTitle: 'Enquiry',
    opportunityDate: '24-09-2026',
    opportunityNumber: 'CTEQ#1005',
    opportunityTags: '',
    leadNumberOrigin: 'CTL#1002',
    oppSource: 'Website Inbound',
    oppSourceName: '',
    oppRating: 'COLD',
    closeDate: '24-10-2026',
    oppStage: 'Enquiry',
    amount: '85000',
    oppComments: '',
    oppBizOpportunity: 'HVAC Installation',
    lpoDate: '',
    lpoNumber: '',
    competitorsDetails: '',
    nextAction: '',
    winProbability: 10,
    deliveryDate: ''
  });

  // Form State for + LEAD
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: 'Mussafah Industrial Area, Abu Dhabi',
    phone: '',
    email: '',
    spec: 'Enquiry',
    opportunity: 'Industrial Chillers Supply',
    owner: defaultOwnerName,
    rating: 'COLD',
    status: 'Pending',
    source: 'Direct Inbound'
  });

  // Live leads records (Safely initialized from props or storage, preserving existing user data)
  const [leadList, setLeadList] = useState(() => {
    const fromProps = (Array.isArray(leads) && leads.length > 0) ? leads : ((Array.isArray(_leads) && _leads.length > 0) ? _leads : null);
    if (fromProps) return fromProps;
    try {
      const saved = localStorage.getItem('alzaydan_crm_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Sync back to parent leads state and localStorage when leadList changes
  useEffect(() => {
    if (leadList.length > 0) {
      try {
        localStorage.setItem('alzaydan_crm_leads', JSON.stringify(leadList));
      } catch {}
    }
    if (typeof setLeads === 'function') {
      setLeads(leadList);
    }
  }, [leadList, setLeads]);

  // Combined owners from active current users
  const availableOwners = useMemo(() => {
    const names = [];
    availableUsers.forEach((emp) => {
      if (emp.name && !names.includes(emp.name)) names.push(emp.name);
    });
    return names.length > 0 ? names : ['Super Admin'];
  }, [availableUsers]);

  // Count duplicate leads
  const duplicateCount = useMemo(() => {
    return leadList.filter((l) => l.isDuplicate).length;
  }, [leadList]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedOwner('all');
    setSelectedCreatedBy('all');
    setSelectedStatus('all');
    setSelectedRating('all');
    setBusinessOpportunity('all');
    setSelectedCampaign('all');
    setInactiveFromDate('');
    setLeadDateFilter('');
    setCreatedDateFilter('');
    setAssignedDateFilter('');
    setSelectedSource('all');
    setSelectedTag('');
    setSearchQuery('');
    setCurrentPage(1);
    toast.info('All filters reset');
  };

  // Toggle select all checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leadList.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  // Toggle individual row selection
  const handleToggleSelectRow = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete single lead
  const handleDeleteLead = (id, name) => {
    setLeadList((prev) => prev.filter((l) => l.id !== id));
    setSelectedLeadIds((prev) => prev.filter((i) => i !== id));
    setActiveActionMenuId(null);
    toast.success(`Lead "${name}" deleted`);
  };

  // Bulk reassign
  const handleBulkAssignSubmit = (e) => {
    e.preventDefault();
    if (selectedLeadIds.length === 0) {
      toast.error('Please select at least one lead from the table');
      return;
    }
    setLeadList((prev) =>
      prev.map((l) =>
        selectedLeadIds.includes(l.id)
          ? { ...l, assignedTo: bulkAssignTarget, owner: bulkAssignTarget }
          : l
      )
    );
    toast.success(`${selectedLeadIds.length} lead(s) successfully assigned to ${bulkAssignTarget}`);
    setIsAssignModalOpen(false);
    setSelectedLeadIds([]);
  };

  // Create new Lead submit
  const handleCreateLeadSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) {
      toast.error('Please fill in contact name and company');
      return;
    }

    const nextId = Date.now();
    const newLead = {
      id: nextId,
      codeNum: String(100016 + leadList.length),
      leadCode: `AZ#${1004 + leadList.length}`,
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      assignedTo: formData.owner,
      assigneeAvatarBg: 'bg-[#011635] text-white',
      name: formData.name.trim().toUpperCase(),
      company: formData.company.trim(),
      location: formData.location.trim() || 'Dubai, UAE',
      phone: formData.phone.trim() || '+971 500000000',
      email: formData.email.trim(),
      spec: formData.spec,
      opportunity: formData.opportunity,
      campaign: 'Direct Inbound',
      createdBy: 'Super Admin',
      creatorAvatarBg: 'bg-[#011635] text-white',
      owner: formData.owner,
      ownerAvatarBg: 'bg-[#0055D4] text-white',
      rating: formData.rating,
      status: formData.status,
      lastActivityDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      lastActivityDays: 'Today',
      source: formData.source,
      isDuplicate: false
    };

    if (editingLeadId !== null) {
      setLeadList((prev) => prev.map((lead) => lead.id === editingLeadId ? { ...lead, ...newLead, id: editingLeadId } : lead));
      toast.success('Lead ' + newLead.name + ' updated successfully');
      setEditingLeadId(null);
    } else {
      setLeadList((prev) => [newLead, ...prev]);
      toast.success('Commercial Lead ' + newLead.name + ' created successfully!');
    }
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      company: '',
      location: 'Mussafah Industrial Area, Abu Dhabi',
      phone: '',
      email: '',
      spec: 'Enquiry',
      opportunity: 'Industrial Chillers Supply',
      owner: 'Tariq',
      rating: 'COLD',
      status: 'Pending',
      source: 'Direct Inbound'
    });
  };

  // Handle Add Lead form submit (matching Image 1)
  const handleAddLeadSubmit = (e) => {
    e.preventDefault();
    if (!addLeadForm.contactName.trim() && !addLeadForm.customerName.trim()) {
      toast.error('Please enter Contact Name or Customer Name');
      return;
    }

    const nextId = Date.now();
    const createdLead = {
      id: nextId,
      codeNum: String(100016 + leadList.length),
      leadCode: addLeadForm.leadNumber || `CTL#${1002 + leadList.length}`,
      date: addLeadForm.leadDate || '16-11-2026',
      assignedDate: addLeadForm.leadDate || '16-11-2026',
      assignedTo: addLeadForm.assignTo.replace(' (EMPLOYEE)', ''),
      assigneeAvatarBg: 'bg-[#011635] text-white',
      name: (addLeadForm.contactName || addLeadForm.customerName).trim().toUpperCase(),
      contactName: addLeadForm.contactName.trim(),
      customerName: addLeadForm.customerName.trim(),
      company: addLeadForm.customerName.trim() || 'New Enterprise Client',
      location: addLeadForm.location.trim() || 'Dubai, UAE',
      phone: addLeadForm.businessMobile
        ? `${addLeadForm.businessMobilePrefix} ${addLeadForm.businessMobile}`
        : '+971 50 123 4567',
      businessMobile: addLeadForm.businessMobile,
      email: addLeadForm.email.trim() || 'info@client.ae',
      spec: 'Enquiry',
      opportunity: addLeadForm.businessOpportunity || 'Industrial Chillers Supply',
      businessOpportunity: addLeadForm.businessOpportunity || 'Industrial Chillers Supply',
      campaign: addLeadForm.campaign || 'Direct Inbound',
      leadTags: addLeadForm.leadTags || '',
      sourceName: addLeadForm.sourceName || '',
      createdBy: 'Super Admin',
      creatorAvatarBg: 'bg-slate-800 text-white',
      owner: addLeadForm.leadOwner.replace(' (EMPLOYEE)', ''),
      ownerAvatarBg: 'bg-emerald-600 text-white',
      rating: addLeadForm.rating,
      status: addLeadForm.status,
      lastActivityDate: addLeadForm.leadDate || '16-11-2026',
      lastActivityDays: 'Today',
      source: addLeadForm.source || 'Direct Inbound',
      verified: true
    };

    setLeadList((prev) => [createdLead, ...prev]);
    toast.success(`Lead ${createdLead.leadCode} (${createdLead.name}) created successfully!`);
    setViewMode('list');

    // Reset form for next entry
    setAddLeadForm((prev) => ({
      ...prev,
      contactName: '',
      customerName: '',
      businessMobile: '',
      email: '',
      website: '',
      location: '',
      comments: '',
      leadNumber: `CTL#${1003 + leadList.length}`
    }));
  };

  // Open View Lead page (Image 2)
  const handleOpenViewLead = (lead) => {
    setActiveLead(lead);
    setViewMode('view');
  };

  // Open Edit Lead page (Image 3)
  const handleOpenEditLead = (lead) => {
    setActiveLead(lead);
    const rawPhone = lead.businessMobile || lead.phone || '';
    const cleanPhone = String(rawPhone).replace(/^\+971\s*/, '');
    setEditLeadForm({
      id: lead.id,
      leadCode: lead.leadCode || '',
      leadOwner: lead.owner || defaultOwnerName,
      assignTo: lead.assignedTo || defaultAssigneeName,
      contactPrefix: lead.contactPrefix || 'Mr.',
      contactName: lead.contactName || lead.name || '',
      businessMobilePrefix: lead.businessMobilePrefix || '+971',
      businessMobile: cleanPhone,
      email: lead.email || '',
      customerName: lead.customerName || lead.company || '',
      website: lead.website || '',
      campaign: lead.campaign || '',
      sourceName: lead.sourceName || '',
      status: lead.status || 'Pending',
      location: lead.location || 'Dubai, UAE',
      leadDate: lead.date || '16-11-2026',
      designation: lead.designation || 'Select',
      personalMobilePrefix: '+971',
      personalMobile: lead.personalMobile || '',
      nationality: lead.nationality || 'Select',
      telPrefix: '+971',
      tel: lead.tel || '',
      leadTags: lead.leadTags || lead.tags || '',
      source: lead.source || 'Website Inbound',
      rating: lead.rating || 'COLD',
      businessOpportunity: lead.opportunity || lead.businessOpportunity || 'HVAC Installation',
      comments: lead.comments || ''
    });
    setViewMode('edit');
  };

  // Handle Edit Lead submit (Image 3)
  const handleEditLeadSubmit = (e) => {
    e.preventDefault();
    if (!editLeadForm.contactName.trim() && !editLeadForm.customerName.trim()) {
      toast.error('Please enter Contact Name or Customer Name');
      return;
    }

    const updatedLead = {
      ...activeLead,
      owner: editLeadForm.leadOwner.replace(' (EMPLOYEE)', ''),
      assignedTo: editLeadForm.assignTo.replace(' (EMPLOYEE)', ''),
      contactPrefix: editLeadForm.contactPrefix,
      contactName: editLeadForm.contactName.trim(),
      name: (editLeadForm.contactName || editLeadForm.customerName).trim().toUpperCase(),
      businessMobilePrefix: editLeadForm.businessMobilePrefix,
      businessMobile: editLeadForm.businessMobile.trim(),
      phone: editLeadForm.businessMobile
        ? `${editLeadForm.businessMobilePrefix} ${editLeadForm.businessMobile}`
        : (activeLead.phone || ''),
      email: editLeadForm.email.trim(),
      customerName: editLeadForm.customerName.trim(),
      company: editLeadForm.customerName.trim() || activeLead.company,
      website: editLeadForm.website.trim(),
      campaign: editLeadForm.campaign,
      sourceName: editLeadForm.sourceName,
      status: editLeadForm.status,
      location: editLeadForm.location.trim(),
      date: editLeadForm.leadDate,
      designation: editLeadForm.designation,
      personalMobile: editLeadForm.personalMobile,
      nationality: editLeadForm.nationality,
      tel: editLeadForm.tel,
      leadTags: editLeadForm.leadTags,
      source: editLeadForm.source,
      rating: editLeadForm.rating,
      opportunity: editLeadForm.businessOpportunity,
      businessOpportunity: editLeadForm.businessOpportunity,
      comments: editLeadForm.comments,
      lastActivityDate: editLeadForm.leadDate || '16-11-2026',
      lastActivityDays: 'Today'
    };

    setLeadList((prev) => prev.map((l) => (l.id === activeLead.id ? updatedLead : l)));
    setActiveLead(updatedLead);
    toast.success(`Lead ${updatedLead.leadCode} updated successfully!`);
    setViewMode('list');
  };

  // Open Convert Lead page (Image 6)
  const handleOpenConvertLead = (lead) => {
    setActiveLead(lead);
    const company = lead.customerName || lead.company || '';
    const contact = lead.contactName || lead.name || '';
    const rawPhone = lead.businessMobile || lead.phone || '';
    const cleanPhone = String(rawPhone).replace(/^\+971\s*/, '');
    setConvertForm({
      owner: lead.owner || lead.assignedTo || defaultOwnerName,
      contactPrefix: lead.contactPrefix || 'Mr.',
      contactName: contact,
      designation: lead.designation || 'Select',
      source: lead.source || 'Website Inbound',
      personalMobilePrefix: '+971',
      personalMobile: lead.personalMobile || '',
      businessMobilePrefix: lead.businessMobilePrefix || '+971 (UAE)',
      businessMobile: cleanPhone,
      address: lead.address || '',
      email: lead.email || '',
      stateRegion: (typeof lead.location === 'string' && lead.location.includes(','))
        ? lead.location.split(',')[0].trim()
        : (lead.location || 'Dubai'),
      nationality: lead.nationality || 'United Arab Emirates',
      spokenLanguage: 'Select',
      comments: lead.comments || '',
      customerName: company,
      industryType: 'Select',
      parentCustomer: 'Select',
      customerTags: `${lead.leadCode || 'CTL#1002'}, New Lead`,
      sourceName: lead.sourceName || '',
      keyCustomer: 'No',
      campaign: lead.campaign || 'SIMPLE LIFE - 2025',
      noOfEmployees: '50',
      telPrefix: '+971',
      tel: lead.tel || '',
      website: lead.website || '',
      customerAddress: lead.location || '',
      country: 'United Arab Emirates',
      location: lead.location || 'Dubai, UAE',
      trn: '',
      isSupplier: false,
      addOpportunity: true,
      opportunityTitle: 'Enquiry',
      opportunityDate: '24-09-2026',
      opportunityNumber: `CTEQ#${1000 + Math.floor(Math.random() * 9000)}`,
      opportunityTags: `${lead.leadCode || 'CTL#1002'}, New Lead`,
      leadNumberOrigin: lead.leadCode || 'CTL#1002',
      oppSource: lead.source || 'Website Inbound',
      oppSourceName: lead.sourceName || '',
      oppRating: lead.rating || 'COLD',
      closeDate: '24-10-2026',
      oppStage: 'Enquiry',
      amount: '85000',
      oppComments: lead.comments || '',
      oppBizOpportunity: lead.opportunity || 'HVAC Installation',
      lpoDate: '',
      lpoNumber: '',
      competitorsDetails: '',
      nextAction: '',
      winProbability: 10,
      deliveryDate: ''
    });
    setViewMode('convert');
  };

  // Handle Convert Lead submit (Image 6)
  const handleConvertLeadSubmit = (e) => {
    e.preventDefault();
    if (!convertForm.customerName.trim() && !convertForm.contactName.trim()) {
      toast.error('Please enter Contact Name or Customer Name');
      return;
    }

    // 1. Create Customer
    const newCustomer = {
      id: Date.now(),
      name: convertForm.customerName.trim() || convertForm.contactName.trim(),
      customerName: convertForm.customerName.trim(),
      contactPerson: convertForm.contactName.trim(),
      phone: convertForm.businessMobile,
      email: convertForm.email,
      location: convertForm.location,
      country: convertForm.country,
      owner: convertForm.owner,
      status: 'Active',
      type: 'Client',
      industry: convertForm.industryType,
      trn: convertForm.trn,
      website: convertForm.website
    };

    try {
      const storedCust = JSON.parse(localStorage.getItem('alzaydan_crm_customers') || '[]');
      const updatedCust = [newCustomer, ...storedCust.filter(c => c.name !== newCustomer.name)];
      localStorage.setItem('alzaydan_crm_customers', JSON.stringify(updatedCust));
      if (typeof setCustomers === 'function') {
        setCustomers(updatedCust);
      }
    } catch {}

    // 2. If addOpportunity is checked, create Opportunity
    if (convertForm.addOpportunity) {
      const oppCode = convertForm.opportunityNumber || `CTEQ#${Math.floor(1000 + Math.random() * 9000)}`;
      const oppTitle = convertForm.opportunityTitle || `${convertForm.customerName} - Commercial Opportunity`;
      const oppOwner = convertForm.owner || 'shemin';
      const oppDateFormatted = convertForm.opportunityDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const oppAmount = convertForm.amount ? (String(convertForm.amount).startsWith('AED') ? convertForm.amount : `AED ${convertForm.amount}`) : 'AED 0';

      const newOpp = {
        id: Date.now() + 1,
        code: oppCode,
        opportunityNumber: oppCode,
        name: oppTitle,
        title: oppTitle,
        customerName: convertForm.customerName,
        customer: convertForm.customerName,
        pointOfContact: convertForm.contactName,
        contactPerson: convertForm.contactName,
        owner: oppOwner,
        opportunityOwner: oppOwner,
        salesRep: oppOwner,
        ownerAvatarBg: 'bg-[#011635] text-white',
        leadNumber: convertForm.leadNumberOrigin,
        source: convertForm.oppSource,
        sourceName: convertForm.oppSourceName,
        rating: convertForm.oppRating || 'COLD',
        stage: convertForm.oppStage || 'Enquiry',
        probability: Number(convertForm.winProbability) || 10,
        winProbability: Number(convertForm.winProbability) || 10,
        classification: 'A - Enterprise',
        bizType: convertForm.oppBizOpportunity || 'New Business',
        businessOpportunity: convertForm.oppBizOpportunity || 'New Business',
        amount: oppAmount,
        closeDate: convertForm.closeDate || '28-11-2026',
        oppDate: oppDateFormatted,
        assignedDate: oppDateFormatted,
        date: oppDateFormatted,
        lastActivity: oppDateFormatted,
        lastActivityDays: 'Today',
        lpoNumber: convertForm.lpoNumber,
        lpoDate: convertForm.lpoDate,
        comments: convertForm.oppComments,
        status: 'Open'
      };

      try {
        const storedOpp = JSON.parse(localStorage.getItem('alzaydan_crm_opportunities') || '[]');
        const updatedOpp = [newOpp, ...storedOpp.filter(o => o.opportunityNumber !== newOpp.opportunityNumber && o.code !== newOpp.code)];
        localStorage.setItem('alzaydan_crm_opportunities', JSON.stringify(updatedOpp));
        if (typeof setOpportunities === 'function') {
          setOpportunities(updatedOpp);
        }
      } catch {}
    }

    // 3. Mark Lead as Converted
    setLeadList((prev) =>
      prev.map((l) =>
        l.id === activeLead.id
          ? { ...l, status: 'Converted', isConverted: true }
          : l
      )
    );

    toast.success(`Lead ${activeLead.leadCode} converted successfully to Customer & Opportunity!`);
    setViewMode('list');
  };

  // Handle Single Assign Lead submit (Image 5)
  const handleSingleAssignSubmit = (e) => {
    e.preventDefault();
    if (!singleAssignLead) return;
    const targetName = singleAssignTarget.replace(' (EMPLOYEE)', '');
    setLeadList((prev) =>
      prev.map((l) =>
        l.id === singleAssignLead.id
          ? { ...l, assignedTo: targetName, owner: targetName }
          : l
      )
    );
    if (activeLead && activeLead.id === singleAssignLead.id) {
      setActiveLead((prev) => ({
        ...prev,
        assignedTo: targetName,
        owner: targetName
      }));
    }
    toast.success(`Lead ${singleAssignLead.leadCode} assigned to ${targetName}!`);
    setSingleAssignLead(null);
  };

  // Handle Quick Status Change directly from badge
  const handleQuickStatusChange = (leadId, newStatus) => {
    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    setLeadList((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              lastActivityDate: todayStr,
              lastActivityDays: 'Today'
            }
          : l
      )
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => ({
        ...prev,
        status: newStatus,
        lastActivityDate: todayStr,
        lastActivityDays: 'Today'
      }));
    }
    setActiveStatusMenuId(null);
    toast.success(`Lead status updated to ${newStatus}`);
  };

  // Handle Quick Rating Change directly from badge
  const handleQuickRatingChange = (leadId, newRating) => {
    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    setLeadList((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              rating: newRating,
              lastActivityDate: todayStr,
              lastActivityDays: 'Today'
            }
          : l
      )
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => ({
        ...prev,
        rating: newRating,
        lastActivityDate: todayStr,
        lastActivityDays: 'Today'
      }));
    }
    setActiveRatingMenuId(null);
    toast.success(`Lead rating updated to ${newRating}`);
  };

  // Handle Activity add
  const handleAddActivity = (leadId, type) => {
    const text = window.prompt(`Enter ${type} for this lead:`);
    if (!text || !text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLeadActivities((prev) => {
      const existing = prev[leadId] || { Notes: [], Task: [], Files: [], 'Sales Visit': [] };
      const currentList = existing[type] || [];
      return {
        ...prev,
        [leadId]: {
          ...existing,
          [type]: [{ text: text.trim(), time: `Today, ${now}` }, ...currentList]
        }
      };
    });
    toast.success(`${type} added successfully!`);
  };

  // Filtered Leads calculation
  const filteredLeads = useMemo(() => {
    return leadList.filter((l) => {
      if (selectedOwner !== 'all' && l.owner !== selectedOwner) return false;
      if (selectedCreatedBy !== 'all' && l.createdBy !== selectedCreatedBy) return false;
      if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;
      if (selectedRating !== 'all' && l.rating !== selectedRating) return false;
      if (businessOpportunity !== 'all' && l.opportunity !== businessOpportunity) return false;
      if (selectedCampaign !== 'all' && l.campaign !== selectedCampaign) return false;
      if (selectedSource !== 'all' && l.source !== selectedSource) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchCompany = l.company.toLowerCase().includes(q);
        const matchPhone = l.phone.toLowerCase().includes(q);
        const matchCode = l.leadCode.toLowerCase().includes(q) || l.codeNum.includes(q);
        const matchLocation = l.location.toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchPhone && !matchCode && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [
    leadList,
    selectedOwner,
    selectedCreatedBy,
    selectedStatus,
    selectedRating,
    businessOpportunity,
    selectedCampaign,
    selectedSource,
    searchQuery
  ]);

  // Paginated leads
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;
  const pagedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  return (
    <div className="space-y-4">
      {/* ================= TIER: ADD LEAD FULL VIEW (Exact Match to Screenshot) ================= */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Card Header: ≡ Add Lead and [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Menu className="w-4 h-4 text-slate-700" />
              <span>Add Lead</span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to lead list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <form onSubmit={handleAddLeadSubmit} className="space-y-6 text-xs">
            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Lead Owner */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Owner
                  </label>
                  <div className="relative">
                    <select
                      value={addLeadForm.leadOwner}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, leadOwner: e.target.value })}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={`lead-owner-${u.id || u.name}`} value={u.name}>
                          {u.name} ({u.role || u.crmProfile || 'Employee'})
                        </option>
                      ))}
                    </select>
                    <div className="w-5 h-5 rounded-full bg-[#011635] text-white text-[9px] font-bold flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {(addLeadForm.leadOwner || 'S').trim().charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* 2. Assign To */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/70 border border-blue-100 text-[#16477A] font-bold text-xs mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Assign To</span>
                  </div>
                  <div className="relative">
                    <select
                      value={addLeadForm.assignTo}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, assignTo: e.target.value })}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={`assign-to-${u.id || u.name}`} value={u.name}>
                          {u.name} ({u.role || u.crmProfile || 'Employee'})
                        </option>
                      ))}
                    </select>
                    <div className="w-5 h-5 rounded-full bg-[#16477A] text-white text-[9px] font-bold flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {(addLeadForm.assignTo || 'A').trim().charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* 3. Contact Name * */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Contact Name <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-normal text-slate-400">Individual Person</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={addLeadForm.contactPrefix}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, contactPrefix: e.target.value })}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#16477A] w-24 cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Point of contact"
                      value={addLeadForm.contactName}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, contactName: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 4. Business Mobile */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Business Mobile</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={addLeadForm.businessMobilePrefix}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, businessMobilePrefix: e.target.value })}
                      className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#16477A] w-28 cursor-pointer"
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="text"
                      placeholder="50 123 4567"
                      maxLength={addLeadForm.businessMobilePrefix === '+971' ? 11 : 15}
                      value={addLeadForm.businessMobile}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (addLeadForm.businessMobilePrefix === '+971') {
                          const digits = val.replace(/\D/g, '').slice(0, 9);
                          if (digits.length <= 2) val = digits;
                          else if (digits.length <= 5) val = `${digits.slice(0, 2)} ${digits.slice(2)}`;
                          else val = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
                        }
                        setAddLeadForm({ ...addLeadForm, businessMobile: val });
                      }}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 5. Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Add email e.g. client@company.com"
                    value={addLeadForm.email}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 6. Customer Name */}
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Customer Name</span>
                    <span className="text-[10px] font-normal text-slate-400">Company / Organization</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Company or Organization Name"
                    value={addLeadForm.customerName}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 7. Website */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={addLeadForm.website}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, website: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 8. Campaign */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Campaign</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <select
                    value={addLeadForm.campaign}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, campaign: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Campaign</option>
                    <option value="Q4 Industrial Cooling Expo">Q4 Industrial Cooling Expo</option>
                    <option value="Freezone Commercial Outreach">Freezone Commercial Outreach</option>
                    <option value="HVAC Retrofit Drive 2026">HVAC Retrofit Drive 2026</option>
                    <option value="Digital Direct Inbound">Digital Direct Inbound</option>
                  </select>
                </div>

                {/* 9. Source Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the source. Eg. Google, LinkedIn"
                    value={addLeadForm.sourceName}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, sourceName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 10. Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={addLeadForm.status}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Converted">Converted</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* 11. Location (Scrollable Dropdown) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Location</span>
                  </label>
                  <select
                    value={addLeadForm.location}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Location</option>
                    <option value="Dubai, UAE">Dubai, UAE</option>
                    <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
                    <option value="Sharjah, UAE">Sharjah, UAE</option>
                    <option value="Ajman, UAE">Ajman, UAE</option>
                    <option value="Ras Al Khaimah, UAE">Ras Al Khaimah, UAE</option>
                    <option value="Fujairah, UAE">Fujairah, UAE</option>
                    <option value="Umm Al Quwain, UAE">Umm Al Quwain, UAE</option>
                    <option value="Al Ain, UAE">Al Ain, UAE</option>
                    <option value="Mussafah Industrial Area, Abu Dhabi">Mussafah Industrial Area, Abu Dhabi</option>
                    <option value="Jebel Ali Free Zone (JAFZA), Dubai">Jebel Ali Free Zone (JAFZA), Dubai</option>
                    <option value="Dubai South (DWC), Dubai">Dubai South (DWC), Dubai</option>
                    <option value="Al Quoz Industrial Area, Dubai">Al Quoz Industrial Area, Dubai</option>
                    <option value="Sharjah Industrial Area, Sharjah">Sharjah Industrial Area, Sharjah</option>
                    <option value="KEZAD / KIZAD, Abu Dhabi">KEZAD / KIZAD, Abu Dhabi</option>
                    <option value="Hamriyah Free Zone, Sharjah">Hamriyah Free Zone, Sharjah</option>
                    <option value="RAKEZ, Ras Al Khaimah">RAKEZ, Ras Al Khaimah</option>
                    <option value="Riyadh, Saudi Arabia">Riyadh, Saudi Arabia</option>
                    <option value="Doha, Qatar">Doha, Qatar</option>
                    <option value="Other Location">Other Location</option>
                  </select>
                </div>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Lead Number * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addLeadForm.leadNumber}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, leadNumber: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Auto-number sequence locked: CTL# / AZ# prefix')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Lead Number Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Lead Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addLeadForm.leadDate}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, leadDate: e.target.value })}
                      className="w-full px-3.5 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      <button
                        type="button"
                        onClick={() => setAddLeadForm({ ...addLeadForm, leadDate: '' })}
                        className="hover:text-slate-600 cursor-pointer"
                        title="Clear Date"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <label className="cursor-pointer hover:text-blue-600 transition-colors" title="Choose date">
                        <Calendar className="w-3.5 h-3.5" />
                        <input
                          type="date"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setAddLeadForm({ ...addLeadForm, leadDate: `${d}-${m}-${y}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Nationality */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nationality
                  </label>
                  <select
                    value={addLeadForm.nationality}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, nationality: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Nationality</option>
                    <option value="Emirati (UAE)">Emirati (UAE)</option>
                    <option value="Saudi">Saudi</option>
                    <option value="Qatari">Qatari</option>
                    <option value="Omani">Omani</option>
                    <option value="Kuwaiti">Kuwaiti</option>
                    <option value="Indian">Indian</option>
                    <option value="British">British</option>
                    <option value="Egyptian">Egyptian</option>
                    <option value="Pakistani">Pakistani</option>
                  </select>
                </div>

                {/* 4. Lead Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Tags
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP, Priority, Chiller"
                    value={addLeadForm.leadTags}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, leadTags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400"
                  />
                </div>

                {/* 5. Source */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Source</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <select
                    value={addLeadForm.source}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, source: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Source</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Trade Exhibition">Trade Exhibition</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>

                {/* 6. Rating */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Rating</span>
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </label>
                  <div className="flex items-center gap-2">
                    {['COLD', 'WARM', 'HOT'].map((rate) => {
                      const isActive = addLeadForm.rating === rate;
                      return (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setAddLeadForm({ ...addLeadForm, rating: rate })}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isActive
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

                {/* 7. Business Opportunity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Opportunity
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={addLeadForm.businessOpportunity}
                      onChange={(e) => setAddLeadForm({ ...addLeadForm, businessOpportunity: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                    >
                      <option value="">Select Business Opportunity</option>
                      <option value="Commercial Chillers Supply">Commercial Chillers Supply</option>
                      <option value="HVAC Maintenance Contract">HVAC Maintenance Contract</option>
                      <option value="Cold Storage Retrofit">Cold Storage Retrofit</option>
                      <option value="District Cooling Substations">District Cooling Substations</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => toast.info('New Business Opportunity added')}
                      className="px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ New</span>
                    </button>
                  </div>
                </div>

                {/* 8. Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Comments
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter lead requirements, background or project notes..."
                    value={addLeadForm.comments}
                    onChange={(e) => setAddLeadForm({ ...addLeadForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Row: [Submit] and [← Back] */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 z-10 -mx-2 px-2 rounded-b-xl">
              <button
                type="submit"
                className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TIER: LEAD LIST VIEW ================= */}
      {viewMode === 'list' && (
        <>
          {/* ================= TIER 1: TOP 12-FIELD FILTER WORKSPACE (Exact Match to Image) ================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        {/* Row 1: Select Owner | Created By | Status | Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Select Owner
            </label>
            <select
              value={selectedOwner}
              onChange={(e) => { setSelectedOwner(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">All Owners</option>
              {availableOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Created By
            </label>
            <select
              value={selectedCreatedBy}
              onChange={(e) => { setSelectedCreatedBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">All</option>
              {availableOwners.map((owner) => (
                <option key={`created-by-${owner}`} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Rating
            </label>
            <select
              value={selectedRating}
              onChange={(e) => { setSelectedRating(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="COLD">COLD</option>
            </select>
          </div>
        </div>

        {/* Row 2: Business Opportunity | Campaign | Inactive From | Lead Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Business Opportunity
            </label>
            <select
              value={businessOpportunity}
              onChange={(e) => { setBusinessOpportunity(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">Select Type</option>
              <option value="Industrial Chillers Supply">Industrial Chillers Supply</option>
              <option value="Cold Storage Installation">Cold Storage Installation</option>
              <option value="HVAC Units Installation">HVAC Units Installation</option>
              <option value="Chiller Plant Maintenance">Chiller Plant Maintenance</option>
              <option value="HVAC Supply">HVAC Supply</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => { setSelectedCampaign(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">Select Campaign</option>
              <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
              <option value="JAFZA Logistics Outreach">JAFZA Logistics Outreach</option>
              <option value="Direct Inbound">Direct Inbound</option>
              <option value="Digital Ads">Digital Ads</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Inactive From
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select Date"
                value={inactiveFromDate}
                onChange={(e) => setInactiveFromDate(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lead Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="All Month & Year"
                value={leadDateFilter}
                onChange={(e) => setLeadDateFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 3: Lead Created Date | Lead Assigned Date | Source | Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lead Created Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="All Month & Year"
                value={createdDateFilter}
                onChange={(e) => setCreatedDateFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lead Assigned Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="All Month & Year"
                value={assignedDateFilter}
                onChange={(e) => setAssignedDateFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
            >
              <option value="all">Select Source</option>
              <option value="Direct Inbound">Direct Inbound</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Trade Exhibition">Trade Exhibition</option>
              <option value="WhatsApp Business">WhatsApp Business</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Tags
            </label>
            <input
              type="text"
              placeholder="Select tags"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
            />
          </div>
        </div>

        {/* Filter Footer Controls */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ================= TIER 2: LEAD LIST & TABLE WORKSPACE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-visible">
        {/* Table Top Header with Action Buttons */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
          {/* Left Title: [🔴 1] Lead List */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
              <span>{filteredLeads.length}</span>
            </span>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Lead List
            </h2>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Duplicate Lead(s) Button */}
            <button
              type="button"
              onClick={() => setIsDuplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {duplicateCount}
              </span>
              <span>Duplicate Lead(s)</span>
            </button>

            {/* 2. Assign Lead Button */}
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Lead</span>
            </button>

            {/* 3. Upload Lead Button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Lead</span>
            </button>

            {/* 4. + LEAD Button */}
            <button
              type="button"
              onClick={() => setViewMode('create')}
              className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ LEAD</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Shows [10 ▾] Rows & Search Lead */}
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
              placeholder="Search Lead"
              className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table Workspace (Exact column match to Image) */}
        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        filteredLeads.length > 0 &&
                        selectedLeadIds.length === filteredLeads.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#0055D4] focus:ring-0 cursor-pointer"
                    />
                    <span>SL.No</span>
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                    <span>Lead Date</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Lead Assigned</th>
                <th className="py-3 px-3 min-w-[200px]">Contact Details</th>
                <th className="py-3 px-3">Lead Spec</th>
                <th className="py-3 px-3">Created By</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Activity</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center text-slate-400 font-medium text-xs">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                pagedLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox + SL.No + Lead Code */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectRow(lead.id)}
                            className="mt-0.5 rounded border-slate-300 text-[#0055D4] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-xs">
                              {lead.codeNum}
                            </div>
                            <div className="text-[10px] font-semibold text-sky-600">
                              {lead.leadCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lead Date */}
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px] align-top">
                        {lead.date}
                      </td>

                      {/* Lead Assigned */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-600 font-mono">
                            {lead.assignedDate}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${lead.assigneeAvatarBg}`}
                            >
                              {lead.assignedTo[0]}
                            </div>
                            <span className="font-semibold text-blue-600 text-xs">
                              {lead.assignedTo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-blue-600 text-xs">
                              {lead.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenViewLead(lead)}
                              className="text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="View Lead Details"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{lead.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-mono">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Lead Spec */}
                      <td className="py-3 px-3 text-slate-600 font-medium text-xs align-top">
                        {lead.spec}
                      </td>

                      {/* Created By */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col items-start gap-0.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.creatorAvatarBg}`}
                          >
                            {lead.createdBy[0]}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {lead.createdBy}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col items-start gap-0.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.ownerAvatarBg}`}
                          >
                            {lead.owner[0]}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {lead.owner}
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 align-top">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRatingMenuId(
                                activeRatingMenuId === lead.id ? null : lead.id
                              );
                              setActiveStatusMenuId(null);
                              setActiveActionMenuId(null);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 border cursor-pointer hover:brightness-95 active:scale-95 transition-all ${
                              lead.rating === 'COLD'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : lead.rating === 'HOT'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to change rating"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>{lead.rating}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          {activeRatingMenuId === lead.id && (
                            <div
                              className="absolute left-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] py-1 text-left animate-in fade-in duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Rating
                              </div>
                              {['COLD', 'WARM', 'HOT'].map((rate) => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => handleQuickRatingChange(lead.id, rate)}
                                  className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                    lead.rating === rate ? 'font-bold bg-slate-50' : 'text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      rate === 'COLD'
                                        ? 'bg-blue-100 text-blue-700'
                                        : rate === 'WARM'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-rose-100 text-rose-700'
                                    }`}
                                  >
                                    {rate}
                                  </span>
                                  {lead.rating === rate && (
                                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-top">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusMenuId(
                                activeStatusMenuId === lead.id ? null : lead.id
                              );
                              setActiveRatingMenuId(null);
                              setActiveActionMenuId(null);
                            }}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1.5 text-white shadow-2xs cursor-pointer hover:brightness-95 active:scale-95 transition-all border border-white/20 ${getStatusBadgeClass(
                              lead.status
                            )}`}
                            title="Click to change status"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>{lead.status || 'Pending'}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                          </button>

                          {activeStatusMenuId === lead.id && (
                            <div
                              className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] py-1 text-left animate-in fade-in duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Change Status
                              </div>
                              <div className="py-1">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleQuickStatusChange(lead.id, opt.value)}
                                    className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                      lead.status === opt.value
                                        ? 'bg-slate-100/80 text-slate-900 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                                      <span>{opt.label}</span>
                                    </span>
                                    {lead.status === opt.value && (
                                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                    )}
                                  </button>
                                ))}
                              </div>
                              <div className="border-t border-slate-100 pt-1 mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatusRatingLead(lead);
                                    setStatusRatingDraft({
                                      status: lead.status || 'Pending',
                                      rating: lead.rating || 'COLD',
                                      comments: lead.comments || '',
                                      addNote: false
                                    });
                                    setActiveStatusMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Settings className="w-3 h-3 text-slate-400" />
                                  <span>Change with Notes...</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-600 font-mono">
                            {lead.lastActivityDate}
                          </div>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 inline-block">
                            {lead.lastActivityDays}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right align-top">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(
                                activeActionMenuId === lead.id ? null : lead.id
                              );
                              setActiveStatusMenuId(null);
                              setActiveRatingMenuId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {activeActionMenuId === lead.id && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] py-1 text-left animate-in fade-in duration-100 divide-y divide-slate-100">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenViewLead(lead);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenEditLead(lead);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatusRatingLead(lead);
                                    setStatusRatingDraft({
                                      status: lead.status || 'Pending',
                                      rating: lead.rating || 'COLD',
                                      comments: lead.comments || '',
                                      addNote: false
                                    });
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Change Status &amp; Rating</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSingleAssignLead(lead);
                                    setSingleAssignTarget(lead.assignedTo || lead.owner || defaultAssigneeName);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Assign Lead</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenConvertLead(lead);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Convert Lead</span>
                                </button>
                              </div>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteLead(lead.id, lead.name);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Lead</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing {filteredLeads.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredLeads.length)} of {filteredLeads.length} entries
            {selectedLeadIds.length > 0 && (
              <span className="ml-2 font-semibold text-blue-600">
                ({selectedLeadIds.length} selected)
              </span>
            )}
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === pg
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
      </>
    )}

      {/* ================= TIER: VIEW LEAD DETAILS (Image 2) ================= */}
      {viewMode === 'view' && activeLead && (
        <div className="space-y-4">
          {/* Top Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm">
              <Folder className="w-4 h-4 text-slate-500" />
              <span className="tracking-wide uppercase">
                {activeLead.contactName || activeLead.name} {activeLead.customerName || activeLead.company}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-7 h-7 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to lead list"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Sub Navigation Tab Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800 cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 text-slate-500" />
              <span>Lead</span>
            </button>
          </div>

          {/* Card 1: Lead Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Lead Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-xs">
              {/* Left Column */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Lead Owner</span>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-[#011635] text-white text-[10px] font-bold flex items-center justify-center">
                      {(activeLead.owner || activeLead.assignedTo || 'SA').slice(0, 2).toUpperCase()}
                    </span>
                    <span>{activeLead.owner || activeLead.assignedTo || 'Super Admin'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Lead Date</span>
                  <span className="font-semibold text-slate-800">{activeLead.date || '16-11-2026'}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Created</span>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
                      {(activeLead.createdBy || 'SA').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold">{activeLead.date || '16-11-2026'} 2:15:17 PM</span>
                  </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Last Activity</span>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-[#011635] text-white text-[9px] font-bold flex items-center justify-center">
                      {(activeLead.owner || 'SA').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold">{activeLead.lastActivityDate || activeLead.date || '16-11-2026'} 2:15:17 PM</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px]">
                      {activeLead.lastActivityDays || '1 day'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Contact Name</span>
                  <span className="font-bold text-slate-900">{activeLead.contactName || activeLead.name}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Customer Name</span>
                  <span className="font-bold text-slate-900 uppercase">{activeLead.customerName || activeLead.company}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>Business Mobile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{activeLead.phone || activeLead.businessMobile || '+971 50 123 4567'}</span>
                    <a
                      href={`https://wa.me/${String(activeLead.phone || activeLead.businessMobile || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="Open WhatsApp chat"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Rating</span>
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRatingMenuId(
                          activeRatingMenuId === `view-${activeLead.id}` ? null : `view-${activeLead.id}`
                        );
                        setActiveStatusMenuId(null);
                      }}
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer hover:brightness-95 active:scale-95 transition-all ${
                        activeLead.rating === 'HOT'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : activeLead.rating === 'WARM'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}
                      title="Click to change rating"
                    >
                      <span>{activeLead.rating || 'COLD'}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </button>

                    {activeRatingMenuId === `view-${activeLead.id}` && (
                      <div
                        className="absolute left-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] py-1 text-left animate-in fade-in duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          Rating
                        </div>
                        {['COLD', 'WARM', 'HOT'].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handleQuickRatingChange(activeLead.id, rate)}
                            className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                              activeLead.rating === rate ? 'font-bold bg-slate-50' : 'text-slate-700'
                            }`}
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                rate === 'COLD'
                                  ? 'bg-blue-100 text-blue-700'
                                  : rate === 'WARM'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {rate}
                            </span>
                            {activeLead.rating === rate && (
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-slate-500 font-medium">Status</span>
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStatusMenuId(
                          activeStatusMenuId === `view-${activeLead.id}` ? null : `view-${activeLead.id}`
                        );
                        setActiveRatingMenuId(null);
                      }}
                      className={`px-3 py-1 rounded-md text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1.5 cursor-pointer hover:brightness-95 active:scale-95 transition-all border border-white/20 ${getStatusBadgeClass(
                        activeLead.status
                      )}`}
                      title="Click to change status"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{activeLead.status || 'Pending'}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                    </button>

                    {activeStatusMenuId === `view-${activeLead.id}` && (
                      <div
                        className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] py-1 text-left animate-in fade-in duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          Change Status
                        </div>
                        <div className="py-1">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleQuickStatusChange(activeLead.id, opt.value)}
                              className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                activeLead.status === opt.value
                                  ? 'bg-slate-100/80 text-slate-900 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                                <span>{opt.label}</span>
                              </span>
                              {activeLead.status === opt.value && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 pt-1 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusRatingLead(activeLead);
                              setStatusRatingDraft({
                                status: activeLead.status || 'Pending',
                                rating: activeLead.rating || 'COLD',
                                comments: activeLead.comments || '',
                                addNote: false
                              });
                              setActiveStatusMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Settings className="w-3 h-3 text-slate-400" />
                            <span>Change with Notes...</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start gap-2">
                  <span className="text-slate-500 font-medium pt-0.5">Comments</span>
                  <span className="text-slate-800 font-medium uppercase">
                    {activeLead.comments || 'No comments provided.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons in Card Bottom-Right */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditLead(activeLead)}
                className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSingleAssignLead(activeLead);
                  setSingleAssignTarget(activeLead.assignedTo || activeLead.owner || defaultAssigneeName);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenConvertLead(activeLead)}
                className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Convert</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDeleteLead(activeLead.id, activeLead.name);
                  setViewMode('list');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Card 2: Lead Activities */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Menu className="w-4 h-4 text-slate-500" />
              <span>Lead Activities</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                {['Notes', 'Task', 'Files', 'Sales Visit'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveActivityTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeActivityTab === tab
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'Notes' && <FileText className="w-3.5 h-3.5" />}
                    {tab === 'Task' && <Check className="w-3.5 h-3.5" />}
                    {tab === 'Files' && <Paperclip className="w-3.5 h-3.5" />}
                    {tab === 'Sales Visit' && <MapPin className="w-3.5 h-3.5" />}
                    <span>{tab}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddActivity(activeLead.id, activeActivityTab)}
                className="px-3 py-1 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Add</span>
              </button>
            </div>

            <div className="p-4 text-xs text-slate-500">
              {(!leadActivities[activeLead.id] || !leadActivities[activeLead.id][activeActivityTab] || leadActivities[activeLead.id][activeActivityTab].length === 0) ? (
                <div>No {activeActivityTab}.</div>
              ) : (
                <div className="space-y-2">
                  {leadActivities[activeLead.id][activeActivityTab].map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{item.text}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TIER: EDIT LEAD FULL VIEW (Image 3) ================= */}
      {viewMode === 'edit' && activeLead && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Card Header: ≡ Edit Lead and [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Menu className="w-4 h-4 text-slate-700" />
              <span>Edit Lead: {editLeadForm.leadCode || activeLead.leadCode}</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to lead list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <form onSubmit={handleEditLeadSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* 1. Lead Owner */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Owner
                  </label>
                  <select
                    value={editLeadForm.leadOwner}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, leadOwner: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    {availableUsers.map((u) => (
                      <option key={`edit-owner-${u.name}`} value={u.name}>
                        {u.name} ({u.roleTier?.toUpperCase() || 'USER'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Assigned To */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned To
                  </label>
                  <select
                    value={editLeadForm.assignTo}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, assignTo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    {availableUsers.map((u) => (
                      <option key={`edit-assign-${u.name}`} value={u.name}>
                        {u.name} ({u.roleTier?.toUpperCase() || 'USER'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Contact Name * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editLeadForm.contactPrefix}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, contactPrefix: e.target.value })}
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer shrink-0"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={editLeadForm.contactName}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, contactName: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                  </div>
                </div>

                {/* 4. Business Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>Business Mobile</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editLeadForm.businessMobilePrefix}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, businessMobilePrefix: e.target.value })}
                      className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer shrink-0"
                    >
                      <option value="+971">AE +971</option>
                      <option value="+966">SA +966</option>
                      <option value="+974">QA +974</option>
                      <option value="+968">OM +968</option>
                      <option value="+973">BH +973</option>
                      <option value="+965">KW +965</option>
                      <option value="+91">IN +91</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      value={editLeadForm.businessMobile}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, businessMobile: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                  </div>
                </div>

                {/* 5. Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="info@client.ae"
                      value={editLeadForm.email}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
                      className="w-full px-3.5 pl-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 6. Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company or trade name"
                    value={editLeadForm.customerName}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 7. Website */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={editLeadForm.website}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, website: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 8. Campaign */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Campaign
                  </label>
                  <select
                    value={editLeadForm.campaign}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, campaign: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Campaign</option>
                    <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="HVAC Expo 2026">HVAC Expo 2026</option>
                    <option value="Digital Media">Digital Media</option>
                  </select>
                </div>

                {/* 9. Source Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={editLeadForm.sourceName}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, sourceName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 10. Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {['Pending', 'Contacted', 'Disqualified'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditLeadForm({ ...editLeadForm, status: st })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          editLeadForm.status === st
                            ? 'bg-[#0055D4] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 11. Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Location</span>
                  </label>
                  <select
                    value={editLeadForm.location}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="">Select Location</option>
                    {UAE_LOCATIONS.map((loc) => (
                      <option key={`edit-loc-${loc}`} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* 1. Lead Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editLeadForm.leadDate}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, leadDate: e.target.value })}
                      className="w-full px-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Designation
                  </label>
                  <select
                    value={editLeadForm.designation}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="Procurement Manager">Procurement Manager</option>
                    <option value="Project Engineer">Project Engineer</option>
                    <option value="General Manager">General Manager</option>
                  </select>
                </div>

                {/* 3. Personal Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>Personal Mobile</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editLeadForm.personalMobilePrefix}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, personalMobilePrefix: e.target.value })}
                      className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer shrink-0"
                    >
                      <option value="+971">AE +971</option>
                      <option value="+966">SA +966</option>
                      <option value="+91">IN +91</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      value={editLeadForm.personalMobile}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, personalMobile: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                  </div>
                </div>

                {/* 4. Nationality */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nationality
                  </label>
                  <select
                    value={editLeadForm.nationality}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, nationality: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    <option value="Emirati (UAE)">Emirati (UAE)</option>
                    <option value="Saudi">Saudi</option>
                    <option value="Omani">Omani</option>
                    <option value="Indian">Indian</option>
                    <option value="Pakistani">Pakistani</option>
                    <option value="British">British</option>
                  </select>
                </div>

                {/* 5. Tel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tel</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editLeadForm.telPrefix}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, telPrefix: e.target.value })}
                      className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer shrink-0"
                    >
                      <option value="+971">AE +971</option>
                      <option value="+966">SA +966</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Landline number"
                      value={editLeadForm.tel}
                      onChange={(e) => setEditLeadForm({ ...editLeadForm, tel: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                    />
                  </div>
                </div>

                {/* 6. Lead Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lead Tags
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP, Priority, Chiller"
                    value={editLeadForm.leadTags}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, leadTags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A]"
                  />
                </div>

                {/* 7. Source */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Source
                  </label>
                  <select
                    value={editLeadForm.source}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, source: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                {/* 8. Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {['COLD', 'WARM', 'HOT'].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setEditLeadForm({ ...editLeadForm, rating: rate })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          editLeadForm.rating === rate
                            ? rate === 'COLD'
                              ? 'bg-[#0055D4] text-white shadow-xs'
                              : rate === 'WARM'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Business Opportunity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Opportunity
                  </label>
                  <select
                    value={editLeadForm.businessOpportunity}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, businessOpportunity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                  >
                    <option value="HVAC Installation">HVAC Installation</option>
                    <option value="Industrial Chillers Supply">Industrial Chillers Supply</option>
                    <option value="Cold Room Storage">Cold Room Storage</option>
                    <option value="Air Handling Units">Air Handling Units</option>
                  </select>
                </div>

                {/* 10. Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter lead requirements, background or project notes..."
                    value={editLeadForm.comments}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TIER: CONVERT LEAD FULL PAGE (Image 6) ================= */}
      {viewMode === 'convert' && activeLead && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>Convert Lead</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to lead list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <form onSubmit={handleConvertLeadSubmit} className="space-y-6">
            {/* Section 1: Convert Lead */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Convert Lead</span>
              </div>
              <div className="max-w-md">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Owner
                </label>
                <select
                  value={convertForm.owner}
                  onChange={(e) => setConvertForm({ ...convertForm, owner: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#16477A] cursor-pointer"
                >
                  {availableUsers.map((u) => (
                    <option key={`conv-owner-${u.name}`} value={u.name}>
                      {u.name} ({u.roleTier?.toUpperCase() || 'USER'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Contact Name * */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Contact Name</span>
                    <span className="text-rose-500">*</span>
                    <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={convertForm.contactPrefix}
                      onChange={(e) => setConvertForm({ ...convertForm, contactPrefix: e.target.value })}
                      className="w-24 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer shrink-0"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                    <input
                      type="text"
                      value={convertForm.contactName}
                      onChange={(e) => setConvertForm({ ...convertForm, contactName: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={convertForm.designation}
                    onChange={(e) => setConvertForm({ ...convertForm, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="Procurement Manager">Procurement Manager</option>
                    <option value="Project Engineer">Project Engineer</option>
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source</label>
                  <select
                    value={convertForm.source}
                    onChange={(e) => setConvertForm({ ...convertForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                    <option value="Google Ads">Google Ads</option>
                  </select>
                </div>

                {/* Personal Mobile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block"></span>
                    <span>Personal Mobile</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={convertForm.personalMobilePrefix}
                      onChange={(e) => setConvertForm({ ...convertForm, personalMobilePrefix: e.target.value })}
                      className="w-28 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer shrink-0"
                    >
                      <option value="+971">AE +971</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      value={convertForm.personalMobile}
                      onChange={(e) => setConvertForm({ ...convertForm, personalMobile: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Business Mobile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block"></span>
                    <span>Business Mobile</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={convertForm.businessMobilePrefix}
                      onChange={(e) => setConvertForm({ ...convertForm, businessMobilePrefix: e.target.value })}
                      className="w-32 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer shrink-0"
                    >
                      <option value="+971 (UAE)">AE +971 (UAE)</option>
                    </select>
                    <input
                      type="tel"
                      value={convertForm.businessMobile}
                      onChange={(e) => setConvertForm({ ...convertForm, businessMobile: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <textarea
                    rows={2}
                    placeholder="PO Box, Street, City etc..."
                    value={convertForm.address}
                    onChange={(e) => setConvertForm({ ...convertForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white resize-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={convertForm.email}
                    onChange={(e) => setConvertForm({ ...convertForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* State/Region */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State/Region</label>
                  <select
                    value={convertForm.stateRegion}
                    onChange={(e) => setConvertForm({ ...convertForm, stateRegion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                  </select>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                  <select
                    value={convertForm.nationality}
                    onChange={(e) => setConvertForm({ ...convertForm, nationality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                  </select>
                </div>

                {/* Spoken Language */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Spoken Language</label>
                  <select
                    value={convertForm.spokenLanguage}
                    onChange={(e) => setConvertForm({ ...convertForm, spokenLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>

                {/* Comments */}
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Comments</label>
                  <textarea
                    rows={2}
                    value={convertForm.comments}
                    onChange={(e) => setConvertForm({ ...convertForm, comments: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Customer Details */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Customer Name * */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={convertForm.customerName}
                    onChange={(e) => setConvertForm({ ...convertForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry Type</label>
                  <select
                    value={convertForm.industryType}
                    onChange={(e) => setConvertForm({ ...convertForm, industryType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    <option value="HVAC & Refrigeration">HVAC &amp; Refrigeration</option>
                    <option value="Construction & MEP">Construction &amp; MEP</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>

                {/* Parent Customer */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Customer</label>
                  <select
                    value={convertForm.parentCustomer}
                    onChange={(e) => setConvertForm({ ...convertForm, parentCustomer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Select">Select</option>
                    {Array.isArray(customers) && customers.map((c, idx) => (
                      <option key={`parent-${c.name || c.id || idx}`} value={c.name || ''}>
                        {c.name || 'Unnamed Client'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Tags */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Tags</label>
                  <input
                    type="text"
                    value={convertForm.customerTags}
                    onChange={(e) => setConvertForm({ ...convertForm, customerTags: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source</label>
                  <select
                    value={convertForm.source}
                    onChange={(e) => setConvertForm({ ...convertForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                  </select>
                </div>

                {/* Source Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Name</label>
                  <input
                    type="text"
                    value={convertForm.sourceName}
                    onChange={(e) => setConvertForm({ ...convertForm, sourceName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* Key Customer? */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Customer?</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="keyCustomer"
                        checked={convertForm.keyCustomer === 'Yes'}
                        onChange={() => setConvertForm({ ...convertForm, keyCustomer: 'Yes' })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="keyCustomer"
                        checked={convertForm.keyCustomer === 'No'}
                        onChange={() => setConvertForm({ ...convertForm, keyCustomer: 'No' })}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Campaign */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campaign</label>
                  <select
                    value={convertForm.campaign}
                    onChange={(e) => setConvertForm({ ...convertForm, campaign: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                    <option value="Direct Inbound">Direct Inbound</option>
                  </select>
                </div>

                {/* No. of Employees */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. of Employees</label>
                  <input
                    type="text"
                    placeholder="e.g. 50"
                    value={convertForm.noOfEmployees}
                    onChange={(e) => setConvertForm({ ...convertForm, noOfEmployees: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* Tel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>Tel</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={convertForm.telPrefix}
                      onChange={(e) => setConvertForm({ ...convertForm, telPrefix: e.target.value })}
                      className="w-28 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer shrink-0"
                    >
                      <option value="+971">AE +971</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="04 123 4567"
                      value={convertForm.tel}
                      onChange={(e) => setConvertForm({ ...convertForm, tel: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={convertForm.website}
                    onChange={(e) => setConvertForm({ ...convertForm, website: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <select
                    value={convertForm.country}
                    onChange={(e) => setConvertForm({ ...convertForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={convertForm.location}
                    onChange={(e) => setConvertForm({ ...convertForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer"
                  >
                    {UAE_LOCATIONS.map((loc) => (
                      <option key={`conv-loc-${loc}`} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* TRN */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TRN</label>
                  <input
                    type="text"
                    placeholder="100XXXXXXXXX"
                    value={convertForm.trn}
                    onChange={(e) => setConvertForm({ ...convertForm, trn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white font-mono"
                  />
                </div>

                {/* Is Supplier? */}
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isSupplierChk"
                    checked={convertForm.isSupplier}
                    onChange={(e) => setConvertForm({ ...convertForm, isSupplier: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isSupplierChk" className="font-semibold text-slate-700 cursor-pointer">
                    Is Supplier?
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Add Opportunity for this Lead */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addOppChk"
                  checked={convertForm.addOpportunity}
                  onChange={(e) => setConvertForm({ ...convertForm, addOpportunity: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="addOppChk" className="font-bold text-slate-900 text-xs cursor-pointer flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Add opportunity for this lead.</span>
                </label>
              </div>

              {convertForm.addOpportunity && (
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs pb-2 border-b border-slate-200/60">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Opportunity</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Opportunity Title * */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Opportunity Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={convertForm.opportunityTitle}
                        onChange={(e) => setConvertForm({ ...convertForm, opportunityTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Opportunity Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Opportunity Date</label>
                      <input
                        type="text"
                        value={convertForm.opportunityDate}
                        onChange={(e) => setConvertForm({ ...convertForm, opportunityDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Opportunity Number * */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Opportunity Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={convertForm.opportunityNumber}
                        onChange={(e) => setConvertForm({ ...convertForm, opportunityNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-mono font-bold"
                      />
                    </div>

                    {/* Opportunity Tags */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Opportunity Tags</label>
                      <input
                        type="text"
                        value={convertForm.opportunityTags}
                        onChange={(e) => setConvertForm({ ...convertForm, opportunityTags: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Lead Number (Origin) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Lead Number (Origin)</label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold">
                        <span>{convertForm.leadNumberOrigin}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-700 font-semibold">
                          Linked
                        </span>
                      </div>
                    </div>

                    {/* Source Name */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Source Name</label>
                      <input
                        type="text"
                        value={convertForm.oppSourceName}
                        onChange={(e) => setConvertForm({ ...convertForm, oppSourceName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Source</label>
                      <select
                        value={convertForm.oppSource}
                        onChange={(e) => setConvertForm({ ...convertForm, oppSource: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="Website Inbound">Website Inbound</option>
                        <option value="Direct Inbound">Direct Inbound</option>
                      </select>
                    </div>

                    {/* Close Date * */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Close Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={convertForm.closeDate}
                        onChange={(e) => setConvertForm({ ...convertForm, closeDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                      <div className="flex gap-2">
                        {['COLD', 'WARM', 'HOT'].map((rate) => (
                          <button
                            key={`conv-opp-rate-${rate}`}
                            type="button"
                            onClick={() => setConvertForm({ ...convertForm, oppRating: rate })}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              convertForm.oppRating === rate
                                ? rate === 'COLD'
                                  ? 'bg-[#0055D4] text-white'
                                  : rate === 'WARM'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-rose-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                          >
                            {rate}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount (AED) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Amount (AED)</label>
                      <input
                        type="text"
                        value={convertForm.amount}
                        onChange={(e) => setConvertForm({ ...convertForm, amount: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-mono font-bold"
                      />
                    </div>

                    {/* Stage */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                      <select
                        value={convertForm.oppStage}
                        onChange={(e) => setConvertForm({ ...convertForm, oppStage: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="Enquiry">Enquiry</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                      </select>
                    </div>

                    {/* Business Opportunity */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Business Opportunity</label>
                      <select
                        value={convertForm.oppBizOpportunity}
                        onChange={(e) => setConvertForm({ ...convertForm, oppBizOpportunity: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="HVAC Installation">HVAC Installation</option>
                        <option value="Industrial Chillers Supply">Industrial Chillers Supply</option>
                      </select>
                    </div>

                    {/* Win Probability Slider */}
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span>Win Probability</span>
                        <span className="font-bold text-amber-600">{convertForm.winProbability}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={convertForm.winProbability}
                        onChange={(e) => setConvertForm({ ...convertForm, winProbability: Number(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Convert</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL 1: + LEAD (CREATE LEAD) ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingLeadId !== null ? 'Edit Lead' : 'Create Commercial Lead'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. MR. MANAF"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Al Manaf Technical Works"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone (UAE)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 567848474"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.ae"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Area
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mussafah Industrial Area, Abu Dhabi"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lead Spec
                  </label>
                  <select
                    value={formData.spec}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    <option value="Enquiry">Enquiry</option>
                    <option value="HVAC Installation">HVAC Installation</option>
                    <option value="Maintenance Contract">Maintenance Contract</option>
                    <option value="Spare Parts">Spare Parts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    <option value="COLD">COLD</option>
                    <option value="WARM">WARM</option>
                    <option value="HOT">HOT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lead Owner
                  </label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                  >
                    {availableOwners.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{editingLeadId !== null ? 'Update Lead' : 'Create Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ASSIGN LEAD MODAL ================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Lead(s)
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkAssignSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <p>
                  You currently have{' '}
                  <strong className="text-slate-900">
                    {selectedLeadIds.length} lead(s)
                  </strong>{' '}
                  selected for assignment.
                </p>
                {selectedLeadIds.length === 0 && (
                  <p className="text-rose-500 font-semibold mt-1">
                    * Please check the boxes next to the leads in the table first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignee Team Member *
                </label>
                <select
                  value={bulkAssignTarget}
                  onChange={(e) => setBulkAssignTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  {availableOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedLeadIds.length === 0}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition disabled:opacity-40 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: UPLOAD LEAD MODAL ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Bulk Upload Leads
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">
                  Drag & Drop your Lead CSV or Excel sheet
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: .csv, .xlsx (Max 10MB)
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Download Sample Template</span>
                <button
                  type="button"
                  onClick={() => toast.info('Sample Lead CSV downloaded')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Download .CSV
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Leads spreadsheet processed: 18 leads imported successfully!');
                    setIsUploadModalOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition cursor-pointer"
                >
                  <span>Import Leads</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DUPLICATE LEADS MODAL ================= */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                  {duplicateCount}
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Duplicate Lead Detections
                </h3>
              </div>
              <button
                onClick={() => setIsDuplicateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                The following records share identical phone numbers or trade licenses:
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {leadList
                  .filter((l) => l.isDuplicate)
                  .map((dup) => (
                    <div key={dup.id} className="p-3 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {dup.name} ({dup.company})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Phone: {dup.phone} | Code: {dup.leadCode}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`Duplicate merged into primary record!`);
                            setLeadList((prev) =>
                              prev.map((l) =>
                                l.id === dup.id ? { ...l, isDuplicate: false } : l
                              )
                            );
                            setIsDuplicateModalOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Merge
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE LEAD STATUS AND RATING (Image 4) ================= */}
      {statusRatingLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLeadList((prev) =>
                prev.map((lead) =>
                  lead.id === statusRatingLead.id
                    ? {
                        ...lead,
                        status: statusRatingDraft.status,
                        rating: statusRatingDraft.rating,
                        comments: statusRatingDraft.comments || lead.comments,
                        note: statusRatingDraft.addNote ? statusRatingDraft.comments : lead.note
                      }
                    : lead
                )
              );
              if (activeLead && activeLead.id === statusRatingLead.id) {
                setActiveLead((prev) => ({
                  ...prev,
                  status: statusRatingDraft.status,
                  rating: statusRatingDraft.rating,
                  comments: statusRatingDraft.comments || prev.comments
                }));
              }
              setStatusRatingLead(null);
              toast.success('Lead status and rating updated');
            }}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                Change Lead Status and Rating
              </h3>
              <button
                type="button"
                onClick={() => setStatusRatingLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={statusRatingDraft.status}
                  onChange={(e) => setStatusRatingDraft({ ...statusRatingDraft, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#16477A] text-xs cursor-pointer"
                >
                  {['Pending', 'Contacted', 'Disqualified', 'Qualified', 'Won'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <span>Rating</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </label>
                <div className="flex gap-2">
                  {['COLD', 'WARM', 'HOT'].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setStatusRatingDraft({ ...statusRatingDraft, rating: rate })}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                        statusRatingDraft.rating === rate
                          ? rate === 'COLD'
                            ? 'bg-[#0284C7] text-white shadow-xs'
                            : rate === 'WARM'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={statusRatingDraft.comments}
                  onChange={(e) => setStatusRatingDraft({ ...statusRatingDraft, comments: e.target.value })}
                  placeholder="Enter comments or reason for change..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#16477A] text-xs resize-none"
                />
              </div>

              {/* Add Note */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addNoteChk"
                  checked={statusRatingDraft.addNote}
                  onChange={(e) => setStatusRatingDraft({ ...statusRatingDraft, addNote: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="addNoteChk" className="font-semibold text-slate-700 cursor-pointer">
                  Add Note
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setStatusRatingLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200 bg-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ASSIGN SINGLE LEAD (Image 5) ================= */}
      {singleAssignLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSingleAssignSubmit}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-700" />
                <span>Assign Lead: {singleAssignLead.contactName || singleAssignLead.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSingleAssignLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 text-xs">
                  {singleAssignLead.contactName || singleAssignLead.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {singleAssignLead.location || singleAssignLead.company} &bull; {singleAssignLead.phone || singleAssignLead.businessMobile}
                </div>
                <div className="text-[10px] text-slate-400">
                  Created on: {singleAssignLead.date || '17-11-2026'} by {singleAssignLead.createdBy || 'Super Admin'}
                </div>
              </div>

              {/* Assign To */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Assign To
                </label>
                <select
                  value={singleAssignTarget}
                  onChange={(e) => setSingleAssignTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#16477A] text-xs cursor-pointer font-medium text-slate-800"
                >
                  {availableUsers.map((u) => (
                    <option key={`single-assign-${u.name}`} value={u.name}>
                      ({u.name.slice(0, 1).toUpperCase()}) {u.name} (EMPLOYEE)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSingleAssignLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200 bg-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

