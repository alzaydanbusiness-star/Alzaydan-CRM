import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building,
  Calendar,
  ChevronDown,
  Contact as ContactIcon,
  Edit3,
  Eye,
  FileText,
  Info,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  UploadCloud,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

const COUNTRY_OPTIONS = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Oman',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'India',
  'United Kingdom',
  'United States',
  'Pakistan',
  'Egypt',
  'Philippines',
  'Lebanon',
  'Jordan',
  'Syria',
  'Bangladesh',
  'Other'
];

const LOCATION_OPTIONS = [
  'Dubai',
  'Dubai - Downtown / Business Bay',
  'Dubai - Al Quoz Industrial Area',
  'Dubai - Jebel Ali Free Zone (JAFZA)',
  'Dubai - Dubai Silicon Oasis',
  'Dubai - Deira / Bur Dubai',
  'Abu Dhabi',
  'Abu Dhabi - Mussafah Industrial Area',
  'Abu Dhabi - KIZAD / Khalifa City',
  'Abu Dhabi - Al Reem Island',
  'Sharjah',
  'Sharjah - Industrial Area',
  'Sharjah - SAIF Zone',
  'Ajman',
  'Ajman - Jurf Industrial Area',
  'Ras Al Khaimah',
  'Ras Al Khaimah - RAKEZ Industrial Zone',
  'Fujairah',
  'Umm Al Quwain',
  'Other'
];

// Helper to normalize and ensure customer records have all standard fields
export const normalizeCustomer = (cust, index = 0, defaultOwner = 'Super Admin') => {
  if (!cust) return cust;
  const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const custName = (cust.name || cust.customerName || cust.company || 'Commercial Client').trim();
  const pContact = (cust.primaryContact || cust.contactPerson || custName).trim();
  const phone = (cust.contactPhone || cust.phone || cust.tel || '+971 50 123 4567').trim();
  const email = (cust.email || cust.contactEmail || 'info@client.ae').trim();
  const ownerName = cust.owner && cust.owner !== 'Unassigned' ? cust.owner : (defaultOwner || 'Super Admin');
  const code = cust.code || `AZ-CUST-${100 + index + 1}`;
  const date = cust.date || cust.createdAt || todayStr;
  const industry = cust.industry || 'Commercial Trading';
  const openEnquiries = cust.openEnquiries || '1 Enquiry';
  const lastEnquiry = cust.lastEnquiry || date || 'Today';
  const lastOrder = cust.lastOrder || 'N/A';
  const outstanding = cust.outstanding || 'AED 0.00';
  const ownerAvatarBg = cust.ownerAvatarBg || 'bg-[#011635] text-white';

  return {
    ...cust,
    id: cust.id || Date.now() + index,
    code,
    date,
    name: custName,
    company: cust.company || custName,
    customerName: custName,
    owner: ownerName,
    ownerAvatarBg,
    primaryContact: pContact,
    contactPerson: pContact,
    contactPhone: phone,
    phone,
    email,
    contactEmail: email,
    industry,
    lastEnquiry,
    openEnquiries,
    lastOrder,
    outstanding,
    status: cust.status || 'Active',
    type: cust.type || 'Customer'
  };
};

export default function CustomerManager({
  activeTab = 'Customer', // 'Customer' | 'Contact'
  setActiveTab = () => {},
  employees = [],
  customers = [],
  setCustomers = () => {}
}) {
  // Current active sub-view ('Customer' | 'Contact')
  const currentTab = activeTab;

  // View Mode: 'list' (Customer List table) | 'create' (Add Customer full-workspace - Image 2)
  const [custViewMode, setCustViewMode] = useState('list');

  // -------------------------------------------------------------
  // CUSTOMER VIEW STATE (Image 1)
  // -------------------------------------------------------------
  const [custTypeTab, setCustTypeTab] = useState('All'); // 'All' | 'Customer' | 'Prospect'

  // Customer Filter states (Row 1 & Row 2)
  const [custOwner, setCustOwner] = useState('all');
  const [custCampaign, setCustCampaign] = useState('all');
  const [custIndustry, setCustIndustry] = useState('all');
  const [custKeyCustomer, setCustKeyCustomer] = useState('all');
  const [custSource, setCustSource] = useState('all');
  const [custTags, setCustTags] = useState('');
  const [custAssignedDate, setCustAssignedDate] = useState('');
  const [custNoOrdersAfter, setCustNoOrdersAfter] = useState('');

  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [custRowsPerPage, setCustRowsPerPage] = useState(10);
  const [custCurrentPage, setCustCurrentPage] = useState(1);
  const [activeCustActionId, setActiveCustActionId] = useState(null);

  // Customer Modals
  const [isAssignCustModalOpen, setIsAssignCustModalOpen] = useState(false);
  const [isUploadCustModalOpen, setIsUploadCustModalOpen] = useState(false);
  const [selectedCustDetail, setSelectedCustDetail] = useState(null);

  // Available current real users from directory
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

  const defaultOwner = availableUsers[0]?.name || 'shemin';

  // Live Customer Records (always normalized)
  const [customerList, setCustomerList] = useState(() => {
    let raw = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) raw = parsed;
      } else if (Array.isArray(customers) && customers.length > 0) {
        raw = customers;
      }
    } catch {}
    return raw.map((c, i) => normalizeCustomer(c, i, defaultOwner));
  });

  // Auto-heal incomplete records (e.g. Al ethihad) and save complete schema once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const healed = parsed.map((c, i) => normalizeCustomer(c, i, defaultOwner));
          if (JSON.stringify(healed) !== saved) {
            setCustomerList(healed);
            localStorage.setItem('alzaydan_crm_customers', JSON.stringify(healed));
          }
        }
      }
    } catch {}
  }, []);

  // Synchronize when customer updates occur in other views (e.g. from Add Lead or Opportunity)
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('alzaydan_crm_customers');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomerList(parsed.map((c, i) => normalizeCustomer(c, i, defaultOwner)));
          }
        }
      } catch {}
    };
    window.addEventListener('alzaydan_customer_updated', handleSync);
    return () => window.removeEventListener('alzaydan_customer_updated', handleSync);
  }, []);

  // Initial Add Customer Form state (Customer Name, Email, Location, Address, TRN Number, Country)
  const initialAddCustomerForm = {
    customerName: '',
    email: '',
    trn: '',
    country: 'United Arab Emirates',
    location: '',
    address: ''
  };

  const [addCustomerForm, setAddCustomerForm] = useState(initialAddCustomerForm);

  // -------------------------------------------------------------
  // CONTACT VIEW STATE (Image 2)
  // -------------------------------------------------------------
  const [contOwner, setContOwner] = useState('all');
  const [contCampaign, setContCampaign] = useState('all');
  const [contDesignation, setContDesignation] = useState('all');
  const [contCustomer, setContCustomer] = useState('all');

  const [contSearchQuery, setContSearchQuery] = useState('');
  const [contRowsPerPage, setContRowsPerPage] = useState(10);
  const [contCurrentPage, setContCurrentPage] = useState(1);
  const [activeContActionId, setActiveContActionId] = useState(null);

  // View Mode for Contact: 'list' | 'create'
  const [contViewMode, setContViewMode] = useState('list');

  // Contact Modals
  const [isAssignContModalOpen, setIsAssignContModalOpen] = useState(false);
  const [isUploadContModalOpen, setIsUploadContModalOpen] = useState(false);

  // Add Contact Form
  const initialContFormData = {
    name: '',
    designation: '',
    customerName: '',
    owner: defaultOwner,
    mobile: '',
    email: '',
    location: '',
    address: '',
    country: 'United Arab Emirates',
    isPrimary: false
  };

  const [contFormData, setContFormData] = useState(initialContFormData);

  // Live Contact Records
  const [contactList, setContactList] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Sync contactList to localStorage
  useEffect(() => {
    if (contactList.length > 0) {
      try {
        localStorage.setItem('alzaydan_crm_contacts', JSON.stringify(contactList));
      } catch {}
    }
  }, [contactList]);

  // Available Owners from real stored users
  const availableOwners = useMemo(() => {
    const names = [];
    availableUsers.forEach((emp) => {
      if (emp.name && !names.includes(emp.name)) names.push(emp.name);
    });
    return names.length > 0 ? names : ['Super Admin'];
  }, [availableUsers]);

  // Unique Customer Companies
  const customerCompanyNames = useMemo(() => {
    return Array.from(new Set(customerList.map((c) => c.name || c.company).filter(Boolean)));
  }, [customerList]);

  // Unique Designations
  const contactDesignations = useMemo(() => {
    return Array.from(new Set(contactList.map((c) => c.designation).filter(Boolean)));
  }, [contactList]);

  // -------------------------------------------------------------
  // CUSTOMER HANDLERS
  // -------------------------------------------------------------
  const handleResetCustFilters = () => {
    setCustOwner('all');
    setCustCampaign('all');
    setCustIndustry('all');
    setCustKeyCustomer('all');
    setCustSource('all');
    setCustTags('');
    setCustAssignedDate('');
    setCustNoOrdersAfter('');
    setCustSearchQuery('');
    setCustTypeTab('All');
    setCustCurrentPage(1);
    toast.info('Customer filters reset to default');
  };

  // Handle Add Customer Form Submit (Matching Image 2)
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!addCustomerForm.customerName.trim()) {
      toast.error('Please enter Customer / Company Name');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const newCustId = Date.now();
    const newCustCode = `AZ-CUST-${100 + customerList.length + 1}`;

    const newCust = {
      id: newCustId,
      code: newCustCode,
      date: todayStr,
      name: addCustomerForm.customerName.trim(),
      company: addCustomerForm.customerName.trim(),
      type: 'Customer',
      owner: defaultOwner,
      ownerAvatarBg: 'bg-[#011635] text-white',
      parentCustomer: '',
      tags: '',
      isKeyCustomer: false,
      industry: 'Commercial Trading',
      source: 'Direct Inbound',
      sourceName: '',
      campaign: 'Direct',
      noOfEmployees: '',
      tel: '',
      phone: '+971 50 123 4567',
      website: '',
      email: (addCustomerForm.email || '').trim(),
      address: (addCustomerForm.address || '').trim(),
      country: addCustomerForm.country || 'United Arab Emirates',
      stateRegion: 'Dubai',
      location: (addCustomerForm.location || '').trim() || (addCustomerForm.address || '').trim() || (addCustomerForm.country || 'United Arab Emirates'),
      comments: '',
      trn: (addCustomerForm.trn || '').trim(),
      isSupplier: false,
      primaryContact: 'General Representative',
      contactPhone: '+971 50 123 4567',
      contactEmail: (addCustomerForm.email || '').trim(),
      lastEnquiry: todayStr,
      openEnquiries: '0 Enquiries',
      lastOrder: 'N/A',
      outstanding: 'AED 0.00'
    };

    setCustomerList((prev) => {
      const updated = [newCust, ...prev];
      try {
        localStorage.setItem('alzaydan_crm_customers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (typeof setCustomers === 'function') {
      setCustomers((prev) => [newCust, ...(Array.isArray(prev) ? prev : [])]);
    }

    toast.success(`Customer account "${newCust.name}" created successfully!`);
    setCustViewMode('list');
    setAddCustomerForm(initialAddCustomerForm);
  };

  const handleDeleteCustomer = (id, name) => {
    const updated = customerList.filter(
      (c) => String(c.id) !== String(id) && (c.name || '').toLowerCase() !== (name || '').toLowerCase()
    );
    setCustomerList(updated);
    setActiveCustActionId(null);
    try {
      localStorage.setItem('alzaydan_crm_customers', JSON.stringify(updated));
      if (typeof setCustomers === 'function') {
        setCustomers(updated);
      }
    } catch {}
    toast.success(`Customer "${name}" removed`);
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      if (custTypeTab === 'Customer' && c.type !== 'Customer') return false;
      if (custTypeTab === 'Prospect' && c.type !== 'Prospect') return false;
      if (custOwner !== 'all' && c.owner !== custOwner) return false;
      if (custCampaign !== 'all' && c.campaign !== custCampaign) return false;
      if (custIndustry !== 'all' && c.industry !== custIndustry) return false;
      if (custKeyCustomer === 'Yes' && !c.isKeyCustomer) return false;
      if (custKeyCustomer === 'No' && c.isKeyCustomer) return false;
      if (custSource !== 'all' && c.source !== custSource) return false;

      if (custSearchQuery.trim()) {
        const q = custSearchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchContact = c.primaryContact.toLowerCase().includes(q);
        const matchCode = c.code.toLowerCase().includes(q);
        if (!matchName && !matchContact && !matchCode) return false;
      }
      return true;
    });
  }, [
    customerList,
    custTypeTab,
    custOwner,
    custCampaign,
    custIndustry,
    custKeyCustomer,
    custSource,
    custSearchQuery
  ]);

  const custTotalPages = Math.ceil(filteredCustomers.length / custRowsPerPage) || 1;
  const pagedCustomers = useMemo(() => {
    const start = (custCurrentPage - 1) * custRowsPerPage;
    return filteredCustomers.slice(start, start + custRowsPerPage);
  }, [filteredCustomers, custCurrentPage, custRowsPerPage]);

  // -------------------------------------------------------------
  // CONTACT HANDLERS
  // -------------------------------------------------------------
  const handleResetContFilters = () => {
    setContOwner('all');
    setContCampaign('all');
    setContDesignation('all');
    setContCustomer('all');
    setContSearchQuery('');
    setContCurrentPage(1);
    toast.info('Contact filters reset to default');
  };

  const handleCreateContactSubmit = (e) => {
    e.preventDefault();
    if (!contFormData.name.trim()) {
      toast.error('Please enter contact name');
      return;
    }
    const newCont = {
      id: Date.now(),
      name: contFormData.name.trim(),
      designation: (contFormData.designation || '').trim() || 'Representative',
      customerName: (contFormData.customerName || '').trim() || 'General',
      owner: contFormData.owner || defaultOwner,
      ownerAvatarBg: 'bg-[#011635] text-white',
      mobile: contFormData.mobile.trim() || '+971 50 123 4567',
      email: contFormData.email.trim(),
      location: contFormData.location || '',
      address: contFormData.address || '',
      country: contFormData.country || 'United Arab Emirates',
      isPrimary: Boolean(contFormData.isPrimary),
      campaign: 'Direct'
    };
    setContactList((prev) => {
      const updated = [newCont, ...prev];
      try {
        localStorage.setItem('alzaydan_crm_contacts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Contact "${newCont.name}" added successfully!`);
    setContViewMode('list');
    setContFormData(initialContFormData);
  };

  const handleDeleteContact = (id, name) => {
    setContactList((prev) => {
      const updated = prev.filter((c) => String(c.id) !== String(id) && (c.name || '').toLowerCase() !== (name || '').toLowerCase());
      try {
        localStorage.setItem('alzaydan_crm_contacts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveContActionId(null);
    toast.success(`Contact "${name}" removed`);
  };

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contactList.filter((item) => {
      if (contOwner !== 'all' && item.owner !== contOwner) return false;
      if (contCampaign !== 'all' && item.campaign !== contCampaign) return false;
      if (contDesignation !== 'all' && item.designation !== contDesignation) return false;
      if (contCustomer !== 'all' && item.customerName !== contCustomer) return false;

      if (contSearchQuery.trim()) {
        const q = contSearchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchComp = item.customerName.toLowerCase().includes(q);
        const matchPhone = item.mobile.toLowerCase().includes(q);
        if (!matchName && !matchComp && !matchPhone) return false;
      }
      return true;
    });
  }, [
    contactList,
    contOwner,
    contCampaign,
    contDesignation,
    contCustomer,
    contSearchQuery
  ]);

  const contTotalPages = Math.ceil(filteredContacts.length / contRowsPerPage) || 1;
  const pagedContacts = useMemo(() => {
    const start = (contCurrentPage - 1) * contRowsPerPage;
    return filteredContacts.slice(start, start + contRowsPerPage);
  }, [filteredContacts, contCurrentPage, contRowsPerPage]);

  // Render Add Customer Full Workspace if view mode is 'create' (Exact Match to Image 2)
  if (custViewMode === 'create') {
    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="font-extrabold text-sm uppercase text-slate-900 tracking-tight">
              ADD CUSTOMER
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setCustViewMode('list')}
            className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition shadow-2xs cursor-pointer"
            title="Close and return to list"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          {/* CARD 1: Customer Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-xs text-slate-800">
                Customer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              {/* Row 1: Customer Name * (L) | Email (R) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addCustomerForm.customerName}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, customerName: e.target.value })}
                  placeholder="e.g. Al Noor Trading LLC"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={addCustomerForm.email}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, email: e.target.value })}
                  placeholder="contact@company.ae"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs"
                />
              </div>

              {/* Row 2: TRN Number (L) | Country (R) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  TRN Number
                </label>
                <input
                  type="text"
                  value={addCustomerForm.trn}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, trn: e.target.value })}
                  placeholder="e.g. 100234567800003"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Country
                </label>
                <select
                  value={addCustomerForm.country}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs cursor-pointer font-medium"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Location (L) | Address (R) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Location</span>
                </label>
                <select
                  value={addCustomerForm.location}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs cursor-pointer font-medium"
                >
                  <option value="">Select Location</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Address</span>
                </label>
                <input
                  type="text"
                  value={addCustomerForm.address}
                  onChange={(e) => setAddCustomerForm({ ...addCustomerForm, address: e.target.value })}
                  placeholder="Office No, PO Box, Street, City etc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar: [ Submit ] & [ Back ] */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#011635] text-white hover:bg-[#07244a] shadow-xs transition cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setCustViewMode('list')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render Add Contact Full Workspace if view mode is 'create'
  if (contViewMode === 'create') {
    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="font-extrabold text-sm uppercase text-slate-900 tracking-tight">
              ADD CONTACT
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setContViewMode('list')}
            className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition shadow-2xs cursor-pointer"
            title="Close and return to list"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleCreateContactSubmit} className="space-y-4">
          {/* CARD: Contact Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-xs text-slate-800">
                Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              {/* Row 1: Contact Full Name * | Contact Owner */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Contact Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contFormData.name}
                  onChange={(e) => setContFormData({ ...contFormData, name: e.target.value })}
                  placeholder="e.g. Mnaf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Contact Owner
                </label>
                <select
                  value={contFormData.owner}
                  onChange={(e) => setContFormData({ ...contFormData, owner: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs cursor-pointer font-medium"
                >
                  {availableOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Mobile Phone (UAE) | Email Address */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mobile Phone (UAE)</span>
                </label>
                <input
                  type="text"
                  value={contFormData.mobile}
                  onChange={(e) => setContFormData({ ...contFormData, mobile: e.target.value })}
                  placeholder="e.g. +971 56 784 8474"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={contFormData.email}
                  onChange={(e) => setContFormData({ ...contFormData, email: e.target.value })}
                  placeholder="contact@company.ae"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs"
                />
              </div>

              {/* Row 3: Location (Dropdown) | Address */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Location</span>
                </label>
                <select
                  value={contFormData.location || ''}
                  onChange={(e) => setContFormData({ ...contFormData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs cursor-pointer font-medium"
                >
                  <option value="">Select Location</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Address</span>
                </label>
                <input
                  type="text"
                  value={contFormData.address || ''}
                  onChange={(e) => setContFormData({ ...contFormData, address: e.target.value })}
                  placeholder="Office No, PO Box, Street, City etc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs"
                />
              </div>

              {/* Row 5: Country | Primary Contact? */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Country
                </label>
                <select
                  value={contFormData.country || 'United Arab Emirates'}
                  onChange={(e) => setContFormData({ ...contFormData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#011635] text-xs cursor-pointer font-medium"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(contFormData.isPrimary)}
                    onChange={(e) => setContFormData({ ...contFormData, isPrimary: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Primary Contact?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Bar: [ Submit ] & [ Back ] */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#011635] text-white hover:bg-[#07244a] shadow-xs transition cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setContViewMode('list')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ================= TOP SWITCHER RIBBON ================= */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('Customer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentTab === 'Customer'
                ? 'bg-[#011635] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Customer</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {customerList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentTab === 'Contact'
                ? 'bg-[#011635] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ContactIcon className="w-4 h-4 text-blue-400" />
            <span>Contact</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {contactList.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Al Zaydan CRM &bull; Accounts & Contacts Directory
        </div>
      </div>

      {/* ============================================================== */}
      {/* SCREEN 1: CUSTOMER UI (Matches Image 1 Exactly)               */}
      {/* ============================================================== */}
      {currentTab === 'Customer' && (
        <div className="space-y-4">
          {/* Top Tabs: All | Customer | Prospect ℹ️ */}
          <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200/80 shadow-2xs flex items-center gap-6 text-xs">
            <button
              type="button"
              onClick={() => { setCustTypeTab('All'); setCustCurrentPage(1); }}
              className={`pb-1 font-bold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                custTypeTab === 'All'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border-2 border-rose-500 inline-block" />
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => { setCustTypeTab('Customer'); setCustCurrentPage(1); }}
              className={`pb-1 font-bold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                custTypeTab === 'Customer'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => { setCustTypeTab('Prospect'); setCustCurrentPage(1); }}
              className={`pb-1 font-bold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                custTypeTab === 'Prospect'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Prospect</span>
              <Info className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Customer Top Filter Card (Row 1: 5 cols, Row 2: 3 cols) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Row 1: Owner | Campaign | Industry Type | Key Customer? | Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Owner
                </label>
                <select
                  value={custOwner}
                  onChange={(e) => { setCustOwner(e.target.value); setCustCurrentPage(1); }}
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
                  Campaign
                </label>
                <select
                  value={custCampaign}
                  onChange={(e) => { setCustCampaign(e.target.value); setCustCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">Select</option>
                  <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                  <option value="JAFZA Outreach">JAFZA Outreach</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Industry Type
                </label>
                <select
                  value={custIndustry}
                  onChange={(e) => { setCustIndustry(e.target.value); setCustCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">All Industry</option>
                  <option value="Commercial Trading">Commercial Trading</option>
                  <option value="Freight & Supply Chain">Freight & Supply Chain</option>
                  <option value="Property & Assets">Property & Assets</option>
                  <option value="Energy & Utilities">Energy & Utilities</option>
                  <option value="Technical Contracting">Technical Contracting</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Key Customer?
                </label>
                <select
                  value={custKeyCustomer}
                  onChange={(e) => { setCustKeyCustomer(e.target.value); setCustCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Source
                </label>
                <select
                  value={custSource}
                  onChange={(e) => { setCustSource(e.target.value); setCustCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">Select</option>
                  <option value="Referral">Referral</option>
                  <option value="Direct">Direct</option>
                  <option value="Tender">Tender</option>
                  <option value="Inbound">Inbound</option>
                </select>
              </div>
            </div>

            {/* Row 2: Tags | Assigned Date | No Orders After */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Select tags"
                  value={custTags}
                  onChange={(e) => setCustTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Assigned Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select Date"
                    value={custAssignedDate}
                    onChange={(e) => setCustAssignedDate(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  No Orders After
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select Date"
                    value={custNoOrdersAfter}
                    onChange={(e) => setCustNoOrdersAfter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filter Reset Action */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetCustFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Customer Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header: [🔴 N] Customer List + Action Buttons */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {filteredCustomers.length}
                </span>
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Customer List
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignCustModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Customer/Prospect</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadCustModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Customer/Prospect</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAddCustomerForm(initialAddCustomerForm);
                    setCustViewMode('create');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Customer</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Shows [10 ▾] Rows & Search */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Shows</span>
                <select
                  value={custRowsPerPage}
                  onChange={(e) => {
                    setCustRowsPerPage(Number(e.target.value));
                    setCustCurrentPage(1);
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
                  value={custSearchQuery}
                  onChange={(e) => {
                    setCustSearchQuery(e.target.value);
                    setCustCurrentPage(1);
                  }}
                  placeholder="Search"
                  className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Customer Table */}
            <div className="overflow-x-auto min-h-[280px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-3">SL.No</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 min-w-[180px]">Customer</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Primary Contact</th>
                    <th className="py-3 px-3">Last Enquiry</th>
                    <th className="py-3 px-3">Open Enquiries</th>
                    <th className="py-3 px-3">Last Order</th>
                    <th className="py-3 px-3">Outstanding</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-20 text-center text-slate-400 font-medium text-xs">
                        No customers found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    pagedCustomers.map((cust, idx) => (
                      <tr key={cust.id || `cust-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono text-slate-400 font-bold text-[11px]">
                            {String((custCurrentPage - 1) * custRowsPerPage + idx + 1).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {cust.date}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800 text-xs">
                              {cust.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cust.code} {cust.industry ? `• ${cust.industry}` : ''}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${cust.ownerAvatarBg}`}>
                                {(cust.owner || 'S')[0].toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-700 text-xs">
                                {cust.owner}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-blue-600 text-xs">
                              {cust.primaryContact}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cust.contactPhone}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {cust.lastEnquiry}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {cust.openEnquiries || '0 Enquiries'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {cust.lastOrder}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700 font-mono text-xs">
                            {cust.outstanding}
                          </td>
                          <td className="py-3 px-3 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveCustActionId(
                                  activeCustActionId === cust.id ? null : cust.id
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeCustActionId === cust.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustDetail(cust);
                                    setActiveCustActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View Account</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.info(`Editing account "${cust.name}"`);
                                    setActiveCustActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Edit Details</span>
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

            {/* Footer Pagination */}
            <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing {filteredCustomers.length === 0 ? 0 : (custCurrentPage - 1) * custRowsPerPage + 1} to{' '}
                {Math.min(custCurrentPage * custRowsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setCustCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={custCurrentPage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  Previous
                </button>
                {Array.from({ length: custTotalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCustCurrentPage(pg)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      custCurrentPage === pg
                        ? 'bg-[#0055D4] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustCurrentPage((p) => Math.min(custTotalPages, p + 1))}
                  disabled={custCurrentPage >= custTotalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: CONTACT UI (Matches Image 2 Exactly)                */}
      {/* ============================================================== */}
      {currentTab === 'Contact' && (
        <div className="space-y-4">
          {/* Contact Filter Card (4 Columns matching Image 2) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Contact Owner
                </label>
                <select
                  value={contOwner}
                  onChange={(e) => { setContOwner(e.target.value); setContCurrentPage(1); }}
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
                  Campaign
                </label>
                <select
                  value={contCampaign}
                  onChange={(e) => { setContCampaign(e.target.value); setContCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">Select Campaign</option>
                  <option value="Q4 Industrial Expo">Q4 Industrial Expo</option>
                  <option value="JAFZA Outreach">JAFZA Outreach</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Designation
                </label>
                <select
                  value={contDesignation}
                  onChange={(e) => { setContDesignation(e.target.value); setContCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">Select Designation</option>
                  {contactDesignations.map((desig) => (
                    <option key={desig} value={desig}>
                      {desig}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Customer
                </label>
                <select
                  value={contCustomer}
                  onChange={(e) => { setContCustomer(e.target.value); setContCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer"
                >
                  <option value="all">Select Company</option>
                  {customerCompanyNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Reset Action */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetContFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Contact Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header: [👤 Contact] + Action Buttons */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-[#011635]" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Contact
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignContModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadContModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContFormData(initialContFormData);
                    setContViewMode('create');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Contact</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Shows [10 ▾] Rows & Search Contact */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Shows</span>
                <select
                  value={contRowsPerPage}
                  onChange={(e) => {
                    setContRowsPerPage(Number(e.target.value));
                    setContCurrentPage(1);
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
                  value={contSearchQuery}
                  onChange={(e) => {
                    setContSearchQuery(e.target.value);
                    setContCurrentPage(1);
                  }}
                  placeholder="Search Contact"
                  className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Contact Table (Exact columns: SL.No, Contact Name, Designation, Customer Name, Owner, Mobile, Actions) */}
            <div className="overflow-x-auto min-h-[280px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-3">SL.No</th>
                    <th className="py-3 px-3">Contact Name</th>
                    <th className="py-3 px-3">Designation</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Mobile</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400 font-medium text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <User className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <span>No contacts found.</span>
                          <span className="text-[11px] text-slate-400">
                            Click "+ Contact" above to add your first customer contact.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedContacts.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 font-bold text-[11px]">
                          {String((contCurrentPage - 1) * contRowsPerPage + idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-blue-600 text-xs">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.email}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {item.designation}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {item.customerName}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${item.ownerAvatarBg}`}>
                              {(item.owner || 'U')[0]}
                            </div>
                            <span className="font-semibold text-slate-700 text-xs">
                              {item.owner || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                          {item.mobile}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveContActionId(
                                  activeContActionId === item.id ? null : item.id
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-[#00607A] hover:bg-[#004e63] text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeContActionId === item.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.info(`Calling ${item.mobile}...`);
                                    setActiveContActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Call Contact</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.info(`Emailing ${item.email}...`);
                                    setActiveContActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Send Email</span>
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContact(item.id, item.name)}
                                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

            {/* Footer Pagination */}
            <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing {filteredContacts.length === 0 ? 0 : (contCurrentPage - 1) * contRowsPerPage + 1} to{' '}
                {Math.min(contCurrentPage * contRowsPerPage, filteredContacts.length)} of {filteredContacts.length} entries
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setContCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={contCurrentPage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  Previous
                </button>
                {Array.from({ length: contTotalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setContCurrentPage(pg)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      contCurrentPage === pg
                        ? 'bg-[#0055D4] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setContCurrentPage((p) => Math.min(contTotalPages, p + 1))}
                  disabled={contCurrentPage >= contTotalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ================= MODAL: ASSIGN CUSTOMER/PROSPECT ================= */}
      {isAssignCustModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Customer / Prospect
                </h3>
              </div>
              <button
                onClick={() => setIsAssignCustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Select a team specialist to assign the portfolio to:
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignee
                </label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer">
                  {availableOwners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignCustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Customer portfolio assigned successfully!');
                    setIsAssignCustModalOpen(false);
                  }}
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition cursor-pointer"
                >
                  Assign Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD CUSTOMER/PROSPECT ================= */}
      {isUploadCustModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Bulk Upload Customers/Prospects
                </h3>
              </div>
              <button
                onClick={() => setIsUploadCustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">
                  Drag & Drop CSV / Excel sheet
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: .csv, .xlsx (Max 10MB)
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadCustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Processed spreadsheet: 12 customer accounts imported successfully!');
                    setIsUploadCustModalOpen(false);
                  }}
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition cursor-pointer"
                >
                  Import File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN CONTACT ================= */}
      {isAssignContModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Contact
                </h3>
              </div>
              <button
                onClick={() => setIsAssignContModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Reassign contact portfolio to team member:
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignee
                </label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer">
                  {availableOwners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignContModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Contacts successfully assigned!');
                    setIsAssignContModalOpen(false);
                  }}
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition cursor-pointer"
                >
                  Assign Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD CONTACT ================= */}
      {isUploadContModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#011635]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Bulk Upload Contacts
                </h3>
              </div>
              <button
                onClick={() => setIsUploadContModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">
                  Drag & Drop Contacts CSV / Excel file
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: .csv, .xlsx (Max 10MB)
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadContModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Processed spreadsheet: 25 customer contacts imported successfully!');
                    setIsUploadContModalOpen(false);
                  }}
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-[#011635] text-white hover:bg-[#07244a] shadow-2xs transition cursor-pointer"
                >
                  Import Contacts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW CUSTOMER DETAIL ================= */}
      {selectedCustDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#011635]" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {selectedCustDetail.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedCustDetail.code} &bull; {selectedCustDetail.industry}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {[
                  ['Customer Code', selectedCustDetail.code],
                  ['Account Type', selectedCustDetail.type],
                  ['Industry', selectedCustDetail.industry],
                  ['Account Owner', selectedCustDetail.owner],
                  ['Primary Contact', selectedCustDetail.primaryContact],
                  ['Contact Phone', selectedCustDetail.contactPhone || selectedCustDetail.phone || selectedCustDetail.tel],
                  ['Contact Email', selectedCustDetail.contactEmail || selectedCustDetail.email],
                  ['Website', selectedCustDetail.website],
                  ['Country', selectedCustDetail.country],
                  ['Location', selectedCustDetail.location || selectedCustDetail.stateRegion],
                  ['Address', selectedCustDetail.address],
                  ['TRN / Tax Number', selectedCustDetail.trn],
                  ['Campaign', selectedCustDetail.campaign],
                  ['Source', selectedCustDetail.source],
                  ['Source Name', selectedCustDetail.sourceName],
                  ['Tags', selectedCustDetail.tags],
                  ['Key Customer', selectedCustDetail.isKeyCustomer ? 'Yes' : 'No'],
                  ['Created Date', selectedCustDetail.date],
                  ['Last Enquiry', selectedCustDetail.lastEnquiry],
                  ['Open Enquiries', selectedCustDetail.openEnquiries],
                  ['Last Order', selectedCustDetail.lastOrder],
                  ['Outstanding Balance', selectedCustDetail.outstanding]
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{label}</span>
                    <div className={`font-semibold text-slate-800 break-words ${label === 'Outstanding Balance' ? 'text-emerald-700' : ''}`}>
                      {value === true ? 'Yes' : value === false ? 'No' : value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
