import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  RotateCw,
  Plus,
  Settings,
  Eye,
  Printer,
  Trash2,
  X,
  Calendar,
  MapPin,
  ArrowLeft,
  CreditCard,
  Package,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { getStoredUsers } from '../../../utils/userDirectory';

export default function TaxInvoiceView({
  employees = [],
  customers = [],
  opportunities = []
}) {
  // Mode: 'list' (Matching Reference Image 2) | 'create' (Matching Reference Image 3)
  const [viewMode, setViewMode] = useState('list');

  // Sub-ribbon tab (Image 2: [📄 Invoice] [📋 Payment Followup])
  const [subTab, setSubTab] = useState('Invoice'); // 'Invoice' | 'Payment Followup'

  // Filter States (Image 2: 3 Rows)
  const [filterOwner, setFilterOwner] = useState('All Owners');
  const [filterDateRange, setFilterDateRange] = useState('All Month & Year');
  const [filterCustomer, setFilterCustomer] = useState('Select Customer');
  const [filterOppOrder, setFilterOppOrder] = useState('Select Opportunity/Order');

  const [filterBizOpp, setFilterBizOpp] = useState('Select');
  const [filterProductService, setFilterProductService] = useState('Select Product/Service');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  const [filterInvoiceType, setFilterInvoiceType] = useState('Select Invoice Type');

  const [filterOrderType, setFilterOrderType] = useState('All');

  // Sub-controls
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

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

  const defaultOwner = availableUsers[0]?.name || 'MUHAMMED RISWAN';

  const ownerOptions = useMemo(() => {
    const names = [];
    availableUsers.forEach((u) => {
      if (u.name && !names.includes(u.name)) names.push(u.name);
    });
    return names.length > 0 ? names : ['MUHAMMED RISWAN', 'Super Admin'];
  }, [availableUsers]);

  // Combined opportunities from props and localStorage (including SHAHEER CTEQ#7539 / TAP)
  const availableOpportunities = useMemo(() => {
    let savedList = [];
    try {
      const saved = localStorage.getItem('alzaydan_crm_opportunities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) savedList = parsed;
      }
    } catch {}

    const map = new Map();
    // Default system opportunity matching CTEQ#7539 / tap / hai
    map.set('CTEQ#7539', {
      id: 7539,
      code: 'CTEQ#7539',
      opportunityNumber: 'CTEQ#7539',
      name: 'tap',
      title: 'tap',
      customer: 'hai',
      customerName: 'hai',
      owner: 'muhammed shibil',
      amount: '5250.00',
      rawAmount: 5250.0,
      vat: '262.50',
      total: '5512.50',
      contactPerson: 'Procurement Department',
      pointOfContact: 'Procurement Department',
      mobile: '+971 58 123 4567',
      location: 'Dubai / UAE',
      reference: 'CTEQ#7539',
      opportunityDate: '16-11-2026',
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
        const key = o.code || o.opportunityNumber || o.name || String(o.id);
        if (key) map.set(key, o);
      });
    }
    savedList.forEach((po) => {
      const key = po.code || po.opportunityNumber || po.name || String(po.id);
      if (key) map.set(key, po);
    });

    return Array.from(map.values());
  }, [opportunities]);

  // Combined quotations from localStorage and defaults (including SHAHEER CTSQ#4340 / TAP)
  const availableQuotations = useMemo(() => {
    let list = [];
    const deletedQuots = (() => {
      try {
        return JSON.parse(localStorage.getItem('alzaydan_deleted_quot_ids') || '[]');
      } catch {
        return [];
      }
    })();
    try {
      const saved = localStorage.getItem('alzaydan_crm_quotations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed.filter((q) => !deletedQuots.includes(q.id) && !deletedQuots.includes(q.quotationNo));
      }
    } catch {}

    const map = new Map();
    if (!deletedQuots.includes('CTSQ#4340') && !deletedQuots.includes(4340)) {
      map.set('CTSQ#4340', {
        id: 4340,
        quotationNo: 'CTSQ#4340',
        quotationNumber: 'CTSQ#4340',
        opportunityCode: 'CTEQ#7539',
        opportunity: 'tap',
        customer: 'hai',
        customerName: 'hai',
        owner: 'muhammed shibil',
        date: '16-11-2026',
        amount: '5250.00',
        rawAmount: 5250.0,
        vat: '262.50',
        total: '5512.50',
        contactPerson: 'Procurement Department',
        pointOfContact: 'Procurement Department',
        mobile: '+971 58 123 4567',
        location: 'Dubai / UAE',
        reference: 'CTSQ#4340',
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
    }

    list.forEach((rawQ) => {
      let q = rawQ;
      if (q.quotationNo === 'CTSQ#4340' || (q.opportunity || '').toLowerCase() === 'tap') {
        q = {
          ...q,
          quotationNo: 'CTSQ#4340',
          quotationNumber: 'CTSQ#4340',
          opportunityCode: 'CTEQ#7539',
          opportunity: 'tap',
          customer: 'hai',
          customerName: 'hai',
          rawAmount: 5250.0,
          amount: '5250.00',
          vat: '262.50',
          total: '5512.50',
          products: [
            { id: 1, itemName: 'tap', itemCode: 'sd44', brand: 'll', quantity: 1, price: 2000, total: 2000 },
            { id: 2, itemName: 'glue', itemCode: 'fufu44', brand: 'lp', quantity: 1, price: 3000, total: 3000 }
          ]
        };
      }
      const key = q.quotationNo || q.quotationNumber || String(q.id);
      if (key) map.set(key, q);
    });

    return Array.from(map.values());
  }, []);

  // Combined orders from localStorage and defaults (including hai CTSO#3954 / tap)
  const availableOrders = useMemo(() => {
    let list = [];
    const deletedOrders = (() => {
      try {
        return JSON.parse(localStorage.getItem('alzaydan_deleted_order_ids') || '[]');
      } catch {
        return [];
      }
    })();
    try {
      const saved = localStorage.getItem('alzaydan_crm_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed.filter((o) => !deletedOrders.includes(o.id) && !deletedOrders.includes(o.orderNo));
      }
    } catch {}

    const map = new Map();
    if (!deletedOrders.includes('CTSO#3954') && !deletedOrders.includes(3954)) {
      map.set('CTSO#3954', {
        id: 3954,
        orderNo: 'CTSO#3954',
        orderNumber: 'CTSO#3954',
        opportunity: 'tap',
        opportunityCode: 'CTEQ#7539',
        commercialOfferNumber: 'CTSQ#4340',
        customer: 'hai',
        customerName: 'hai',
        owner: 'muhammed shibil',
        orderDate: '16-11-2026',
        lpoDate: '16-11-2026',
        lpoNumber: 'LPO-2026-9871',
        amount: '5250.00',
        rawAmount: 5250.0,
        rawTotal: 5250.0,
        vat: '262.50',
        total: '5512.50',
        contactPerson: 'Procurement Department',
        pointOfContact: 'Procurement Department',
        mobile: '+971 58 123 4567',
        location: 'Dubai / UAE',
        reference: 'CTSO#3954',
        orderTitle: 'Order for hai (tap)',
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
    }

    list.forEach((o) => {
      const key = o.orderNo || o.orderNumber || String(o.id);
      if (key) map.set(key, o);
    });

    return Array.from(map.values());
  }, []);

  // Combined customers from props, localStorage, and linked commercial pipeline
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

    // Ensure hai and SHAHEER are prominently first
    addCust('hai');
    addCust('SHAHEER');

    if (Array.isArray(customers)) {
      customers.forEach((c) => addCust(c.name || c.customerName));
    }

    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => addCust(c.name || c.customerName));
        }
      }
    } catch {}

    availableOrders.forEach((o) => addCust(o.customer || o.customerName));
    availableQuotations.forEach((q) => addCust(q.customer || q.customerName));
    availableOpportunities.forEach((opp) => addCust(opp.customer || opp.customerName));

    ['Al Futtaim Engineering', 'Emirates Steel', 'ADNOC Distribution', 'Danube Properties'].forEach(addCust);

    return list;
  }, [customers, availableOrders, availableQuotations, availableOpportunities]);

  const oppOrderOptions = useMemo(() => {
    const list = [];
    const seen = new Set();
    const addOpt = (val) => {
      if (!val) return;
      const clean = String(val).trim();
      if (!clean || seen.has(clean)) return;
      seen.add(clean);
      list.push(clean);
    };

    // Pipeline entries
    addOpt('CTSO#3954 - TAP (SHAHEER)');
    addOpt('CTSQ#4340 - TAP (SHAHEER)');
    addOpt('CTEQ#7539 - TAP (SHAHEER)');

    availableOrders.forEach((o) => {
      const num = o.orderNo || o.orderNumber;
      const cust = o.customer || o.customerName;
      const opp = o.opportunity || o.bizOpp || 'Order';
      if (num) addOpt(`${num}${cust ? ` - ${opp} (${cust})` : ''}`);
    });

    availableQuotations.forEach((q) => {
      const num = q.quotationNo || q.quotationNumber;
      const cust = q.customer || q.customerName;
      const opp = q.opportunity || 'Quotation';
      if (num) addOpt(`${num}${cust ? ` - ${opp} (${cust})` : ''}`);
    });

    availableOpportunities.forEach((opp) => {
      const num = opp.code || opp.opportunityNumber;
      const name = opp.name || opp.title;
      const cust = opp.customer || opp.customerName;
      if (num && name) addOpt(`${num} - ${name}${cust ? ` (${cust})` : ''}`);
      else if (name) addOpt(name);
    });

    ['SO-2026-4402', 'Cold Storage Expansion Phase 2', 'Freezone Fleet Logistics Contract', 'Commercial HVAC Retrofit'].forEach(addOpt);

    return list;
  }, [availableOrders, availableQuotations, availableOpportunities]);

  // Live Tax Invoices (Safely initialized, preserving existing data and deletions)
  const [invoices, setInvoices] = useState(() => {
    const deleted = (() => {
      try {
        return JSON.parse(localStorage.getItem('alzaydan_deleted_inv_ids') || '[]');
      } catch {
        return [];
      }
    })();
    try {
      const saved = localStorage.getItem('alzaydan_crm_invoices');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => !deleted.includes(i.id) && !deleted.includes(i.invoiceNo));
        }
      }
    } catch {}
    if (deleted.includes('CTINV#15259') || deleted.includes(1)) {
      return [];
    }
    return [
      {
        id: 1,
        invoiceNo: 'CTINV#15259',
        date: '16-11-2026',
        owner: 'MUHAMMED RISWAN',
        ownerAvatarBg: 'bg-[#011635] text-white',
        opportunityOrder: 'CTSO#3954',
        customer: 'SHAHEER',
        referenceNumber: 'CTSO#3954',
        lpoNumber: 'LPO-2026-9871',
        paymentLocation: 'Mussafah Industrial Area, Abu Dhabi',
        attention: 'Mr. shemeem',
        description: 'Commercial Tax Invoice for TAP - SHAHEER',
        nextFollowup: '30-11-2026',
        rawAmount: 2000.0,
        rawPaid: 0.0,
        amount: 'AED 2,100.00',
        paid: 'AED 0.00',
        balance: 'AED 2,100.00',
        status: 'Pending',
        invoiceType: 'Standard Tax Invoice',
        productService: 'Commercial Technical Services',
        bizOpp: 'New Business',
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
    try {
      localStorage.setItem('alzaydan_crm_invoices', JSON.stringify(invoices));
      window.dispatchEvent(new Event('alzaydan_sales_sync'));
    } catch {}
  }, [invoices]);

  // Full Add Invoice Form State (Matching Reference Image 3 + Inherited Products)
  const [addInvoiceForm, setAddInvoiceForm] = useState({
    // Left Column
    invoiceNumber: 'CTINV#15259',
    customer: '',
    opportunityOrder: '',
    lpoDate: '',
    referenceNumber: '',
    amount: '',
    vatRate: '5',
    paymentLocation: '',

    // Right Column
    invoiceDate: '16-11-2026',
    invoiceDueDate: '',
    lpoNumber: '',
    invoiceType: 'Standard Tax Invoice',
    vatType: 'With VAT',
    documentFileName: '',
    discount: '',
    adjustment: '',
    advancePaid: '0.00',
    attention: '',
    description: '',

    // Checkboxes
    addReceipt: false,
    addPaymentFollowup: false,

    // Inherited Products Line Items
    products: []
  });

  // AUTO-FILL HANDLER: When selecting Customer, auto-fill all pipeline details
  const handleCustomerSelectInInvoice = (customerName) => {
    if (!customerName || customerName === 'Select Customer') {
      setAddInvoiceForm((prev) => ({
        ...prev,
        customer: '',
        opportunityOrder: '',
        amount: '',
        products: []
      }));
      return;
    }

    const custLower = customerName.toLowerCase().trim();

    // 1. Check Sales Orders
    const matchedOrder = availableOrders.find((o) =>
      (o.customer || o.customerName || '').toLowerCase().trim() === custLower
    );

    // 2. Check Quotations
    const matchedQuotation = availableQuotations.find((q) =>
      (q.customer || q.customerName || '').toLowerCase().trim() === custLower
    );

    // 3. Check Opportunities
    const matchedOpp = availableOpportunities.find((op) =>
      (op.customer || op.customerName || '').toLowerCase().trim() === custLower
    );

    // Default products fallback for SHAHEER / TAP
    const defaultProds = [
      {
        id: 1,
        itemName: 'tap',
        itemCode: 'sk1786',
        brand: 'lk',
        quantity: 1,
        price: 2000,
        total: 2000
      }
    ];

    const prods = (matchedOrder?.products && matchedOrder.products.length > 0)
      ? matchedOrder.products
      : (matchedQuotation?.products && matchedQuotation.products.length > 0)
        ? matchedQuotation.products
        : (matchedOpp?.products && matchedOpp.products.length > 0)
          ? matchedOpp.products
          : custLower === 'shaheer' ? defaultProds : [];

    let rawAmount = 0;
    if (prods.length > 0) {
      rawAmount = prods.reduce((sum, p) => sum + (parseFloat(p.total ?? (p.quantity * p.price || 0)) || 0), 0);
    }
    if (!rawAmount) {
      const amtStr = matchedOrder?.rawTotal || matchedOrder?.amount || matchedQuotation?.rawAmount || matchedQuotation?.amount || matchedOpp?.amount || (custLower === 'shaheer' ? '2000.00' : '0');
      rawAmount = parseFloat(String(amtStr).replace(/[^0-9.]/g, '')) || 0;
    }

    const oppOrderVal = matchedOrder?.orderNo || matchedOrder?.orderNumber
      || matchedQuotation?.quotationNo || matchedQuotation?.quotationNumber
      || matchedOpp?.code || matchedOpp?.opportunityNumber || (custLower === 'shaheer' ? 'CTSO#3954' : '');

    const refNo = matchedOrder?.orderNo || matchedOrder?.orderNumber || matchedOrder?.reference
      || matchedQuotation?.quotationNo || matchedQuotation?.reference
      || matchedOpp?.code || matchedOpp?.opportunityNumber || (custLower === 'shaheer' ? 'CTSO#3954' : '');

    const location = matchedOrder?.location || matchedQuotation?.location || matchedOpp?.location || 'Mussafah Industrial Area, Abu Dhabi';
    const attention = matchedOrder?.contactPerson || matchedOrder?.pointOfContact || matchedQuotation?.contactPerson || matchedQuotation?.pointOfContact || matchedOpp?.contactPerson || matchedOpp?.pointOfContact || 'Mr. shemeem';
    const lpoDate = matchedOrder?.lpoDate || matchedOrder?.orderDate || matchedQuotation?.date || '16-11-2026';
    const lpoNumber = matchedOrder?.lpoNumber || 'LPO-2026-9871';
    const desc = `Commercial Tax Invoice for ${matchedOpp?.name || matchedOrder?.opportunity || 'TAP'} - ${customerName}`;

    setAddInvoiceForm((prev) => ({
      ...prev,
      customer: customerName,
      opportunityOrder: oppOrderVal,
      referenceNumber: refNo || prev.referenceNumber,
      lpoDate: lpoDate,
      lpoNumber: lpoNumber,
      amount: rawAmount > 0 ? String(rawAmount.toFixed(2)) : prev.amount,
      paymentLocation: location,
      attention: attention,
      description: desc,
      products: prods
    }));

    toast.success(`Auto-filled details for ${customerName} from ${matchedOrder ? 'Sales Order ' + (matchedOrder.orderNo || matchedOrder.orderNumber) : matchedQuotation ? 'Quotation ' + matchedQuotation.quotationNo : 'Opportunity'}!`);
  };

  // AUTO-FILL HANDLER: When selecting Opportunity/Order/Quotation
  const handleOrderSelectInInvoice = (orderNoOrOpp) => {
    if (!orderNoOrOpp) {
      setAddInvoiceForm((prev) => ({ ...prev, opportunityOrder: '' }));
      return;
    }

    // Clean input
    const cleanKey = orderNoOrOpp.split(' - ')[0].trim();

    // 1. Check Sales Orders
    const matchedOrder = availableOrders.find(
      (o) => o.orderNo === cleanKey || o.orderNumber === cleanKey || o.orderNo === orderNoOrOpp || o.orderNumber === orderNoOrOpp
    );
    if (matchedOrder) {
      const prods = (matchedOrder.products && matchedOrder.products.length > 0)
        ? matchedOrder.products
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
          ];
      let rawNum = prods.reduce((sum, p) => sum + (parseFloat(p.total ?? (p.quantity * p.price || 0)) || 0), 0);
      if (!rawNum) {
        rawNum = matchedOrder.rawTotal || (parseFloat(String(matchedOrder.amount).replace(/[^0-9.]/g, '')) || 2000);
      }

      setAddInvoiceForm((prev) => ({
        ...prev,
        opportunityOrder: matchedOrder.orderNo || matchedOrder.orderNumber || orderNoOrOpp,
        customer: matchedOrder.customer || matchedOrder.customerName || prev.customer || 'SHAHEER',
        amount: String(rawNum.toFixed(2)),
        lpoNumber: matchedOrder.lpoNumber || 'LPO-2026-9871',
        lpoDate: matchedOrder.lpoDate || matchedOrder.orderDate || '16-11-2026',
        referenceNumber: matchedOrder.reference || matchedOrder.orderNo || prev.referenceNumber,
        paymentLocation: matchedOrder.location || 'Mussafah Industrial Area, Abu Dhabi',
        attention: matchedOrder.contactPerson || matchedOrder.pointOfContact || 'Mr. shemeem',
        description: `Tax Invoice for ${matchedOrder.orderTitle || matchedOrder.opportunity || matchedOrder.customer || 'Commercial Client'}`,
        products: prods
      }));
      toast.success(`Auto-filled details from Sales Order ${matchedOrder.orderNo || orderNoOrOpp}!`);
      return;
    }

    // 2. Check Quotations
    const matchedQuotation = availableQuotations.find(
      (q) => q.quotationNo === cleanKey || q.quotationNumber === cleanKey || q.quotationNo === orderNoOrOpp || q.quotationNumber === orderNoOrOpp
    );
    if (matchedQuotation) {
      const prods = (matchedQuotation.products && matchedQuotation.products.length > 0)
        ? matchedQuotation.products
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
          ];
      let rawNum = prods.reduce((sum, p) => sum + (parseFloat(p.total ?? (p.quantity * p.price || 0)) || 0), 0);
      if (!rawNum) {
        rawNum = parseFloat(String(matchedQuotation.amount).replace(/[^0-9.]/g, '')) || 2000;
      }

      setAddInvoiceForm((prev) => ({
        ...prev,
        opportunityOrder: matchedQuotation.quotationNo || matchedQuotation.quotationNumber || orderNoOrOpp,
        customer: matchedQuotation.customer || matchedQuotation.customerName || prev.customer || 'SHAHEER',
        amount: String(rawNum.toFixed(2)),
        referenceNumber: matchedQuotation.quotationNo || prev.referenceNumber,
        paymentLocation: matchedQuotation.location || 'Mussafah Industrial Area, Abu Dhabi',
        attention: matchedQuotation.contactPerson || matchedQuotation.pointOfContact || 'Mr. shemeem',
        lpoDate: matchedQuotation.date || '16-11-2026',
        description: `Tax Invoice for Quotation ${matchedQuotation.quotationNo}`,
        products: prods
      }));
      toast.success(`Auto-filled details from Quotation ${matchedQuotation.quotationNo}!`);
      return;
    }

    // 3. Check Opportunities
    const matchedOpp = availableOpportunities.find(
      (op) => op.name === cleanKey || op.code === cleanKey || op.opportunityNumber === cleanKey || op.name === orderNoOrOpp || op.code === orderNoOrOpp
    );
    if (matchedOpp) {
      const prods = (matchedOpp.products && matchedOpp.products.length > 0)
        ? matchedOpp.products
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
          ];
      let rawNum = prods.reduce((sum, p) => sum + (parseFloat(p.total ?? (p.quantity * p.price || 0)) || 0), 0);
      if (!rawNum) {
        rawNum = parseFloat(String(matchedOpp.amount).replace(/[^0-9.]/g, '')) || 2000;
      }

      setAddInvoiceForm((prev) => ({
        ...prev,
        opportunityOrder: matchedOpp.code || matchedOpp.opportunityNumber || matchedOpp.name,
        customer: matchedOpp.customer || matchedOpp.customerName || prev.customer || 'SHAHEER',
        amount: String(rawNum.toFixed(2)),
        referenceNumber: matchedOpp.code || matchedOpp.opportunityNumber || prev.referenceNumber,
        paymentLocation: matchedOpp.location || 'Mussafah Industrial Area, Abu Dhabi',
        attention: matchedOpp.contactPerson || matchedOpp.pointOfContact || 'Mr. shemeem',
        lpoDate: matchedOpp.opportunityDate || '16-11-2026',
        description: `Tax Invoice for ${matchedOpp.name}`,
        products: prods
      }));
      toast.success(`Auto-filled details from Opportunity "${matchedOpp.name}"!`);
      return;
    }

    setAddInvoiceForm((prev) => ({ ...prev, opportunityOrder: orderNoOrOpp }));
  };

  // Products Table Row Changes inside Add Invoice
  const handleProductChange = (index, field, value) => {
    const updated = [...(addInvoiceForm.products || [])];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      const q = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
      const p = parseFloat(field === 'price' ? value : item.price) || 0;
      item.total = q * p;
    }
    updated[index] = item;
    const sum = updated.reduce((s, it) => s + (parseFloat(it.total) || 0), 0);
    setAddInvoiceForm((prev) => ({
      ...prev,
      products: updated,
      amount: sum > 0 ? String(sum.toFixed(2)) : prev.amount
    }));
  };

  const handleAddProductRow = () => {
    const newProd = {
      id: Date.now() + Math.random(),
      itemName: '',
      itemCode: '',
      brand: '',
      quantity: 1,
      price: '',
      total: 0
    };
    setAddInvoiceForm((prev) => ({
      ...prev,
      products: [...(prev.products || []), newProd]
    }));
  };

  const handleRemoveProductRow = (index) => {
    const updated = (addInvoiceForm.products || []).filter((_, i) => i !== index);
    const sum = updated.reduce((s, it) => s + (parseFloat(it.total) || 0), 0);
    setAddInvoiceForm((prev) => ({
      ...prev,
      products: updated,
      amount: sum > 0 ? String(sum.toFixed(2)) : prev.amount
    }));
  };

  // Dynamic VAT and Total Calculations for Image 3
  const calculatedVatAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addInvoiceForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addInvoiceForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    if (addInvoiceForm.vatType === 'With VAT') {
      const rate = parseFloat(addInvoiceForm.vatRate) || 0;
      return (net * rate) / 100;
    }
    return 0;
  }, [addInvoiceForm.amount, addInvoiceForm.discount, addInvoiceForm.vatRate, addInvoiceForm.vatType]);

  const calculatedTotalAmount = useMemo(() => {
    const rawAmt = parseFloat(String(addInvoiceForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addInvoiceForm.discount).replace(/,/g, '')) || 0;
    const adj = parseFloat(String(addInvoiceForm.adjustment).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    return net + calculatedVatAmount + adj;
  }, [addInvoiceForm.amount, addInvoiceForm.discount, addInvoiceForm.adjustment, calculatedVatAmount]);

  // Reset Filters
  const handleResetFilters = () => {
    setFilterOwner('All Owners');
    setFilterDateRange('All Month & Year');
    setFilterCustomer('Select Customer');
    setFilterOppOrder('Select Opportunity/Order');
    setFilterBizOpp('Select');
    setFilterProductService('Select Product/Service');
    setFilterPaymentStatus('All');
    setFilterInvoiceType('Select Invoice Type');
    setFilterOrderType('All');
    setSearchQuery('');
    toast.info('Invoice filters reset to default');
  };

  // Filtered Invoices
  const filteredList = useMemo(() => {
    return invoices.filter((item) => {
      if (filterOwner !== 'All Owners' && item.owner !== filterOwner) return false;
      if (filterCustomer !== 'Select Customer' && item.customer !== filterCustomer) return false;
      if (filterPaymentStatus !== 'All' && item.status !== filterPaymentStatus) return false;
      if (filterInvoiceType !== 'Select Invoice Type' && item.invoiceType !== filterInvoiceType) return false;
      if (filterBizOpp !== 'Select' && item.bizOpp !== filterBizOpp) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (item.invoiceNo || '').toLowerCase().includes(q);
        const matchCust = (item.customer || '').toLowerCase().includes(q);
        const matchOpp = (item.opportunityOrder || '').toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchOpp && !matchOwner) return false;
      }

      return true;
    });
  }, [
    invoices,
    filterOwner,
    filterCustomer,
    filterPaymentStatus,
    filterInvoiceType,
    filterBizOpp,
    searchQuery
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  // Create Tax Invoice Handler (Image 3)
  const handleAddInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!addInvoiceForm.customer || addInvoiceForm.customer === 'Select Customer') {
      toast.error('Please select a Customer');
      return;
    }
    if (!addInvoiceForm.amount || parseFloat(addInvoiceForm.amount) <= 0) {
      toast.error('Please enter an Invoice Amount');
      return;
    }

    const rawAmt = parseFloat(String(addInvoiceForm.amount).replace(/,/g, '')) || 0;
    const disc = parseFloat(String(addInvoiceForm.discount).replace(/,/g, '')) || 0;
    const net = Math.max(0, rawAmt - disc);
    const vatVal = addInvoiceForm.vatType === 'With VAT' ? (net * (parseFloat(addInvoiceForm.vatRate) || 0)) / 100 : 0;
    const adj = parseFloat(String(addInvoiceForm.adjustment).replace(/,/g, '')) || 0;
    const totalVal = net + vatVal + adj;
    const advPaid = parseFloat(String(addInvoiceForm.advancePaid).replace(/,/g, '')) || 0;
    const balanceVal = Math.max(0, totalVal - advPaid);

    let status = 'Pending';
    if (advPaid >= totalVal && totalVal > 0) status = 'Paid';
    else if (advPaid > 0) status = 'Partially Paid';

    const newInvoice = {
      id: Date.now(),
      invoiceNo: addInvoiceForm.invoiceNumber.trim() || `CTINV#${15259 + invoices.length}`,
      date: addInvoiceForm.invoiceDate || '16-11-2026',
      owner: defaultOwner,
      ownerAvatarBg: 'bg-[#011635] text-white',
      opportunityOrder: addInvoiceForm.opportunityOrder || 'CTSO#3954',
      customer: addInvoiceForm.customer,
      referenceNumber: addInvoiceForm.referenceNumber || 'CTSO#3954',
      lpoDate: addInvoiceForm.lpoDate || '16-11-2026',
      lpoNumber: addInvoiceForm.lpoNumber || 'LPO-2026-9871',
      paymentLocation: addInvoiceForm.paymentLocation || 'Mussafah Industrial Area, Abu Dhabi',
      attention: addInvoiceForm.attention || 'Mr. shemeem',
      description: addInvoiceForm.description || `Commercial Tax Invoice for ${addInvoiceForm.customer}`,
      nextFollowup: addInvoiceForm.invoiceDueDate || '30-11-2026',
      rawAmount: rawAmt,
      rawPaid: advPaid,
      amount: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      paid: `AED ${advPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      balance: `AED ${balanceVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: status,
      invoiceType: addInvoiceForm.invoiceType,
      productService: 'Commercial Technical Services',
      bizOpp: 'New Business',
      products: addInvoiceForm.products && addInvoiceForm.products.length > 0 ? addInvoiceForm.products : [
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
    };

    if (editingInvoiceId) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editingInvoiceId
            ? {
                ...inv,
                invoiceNo: addInvoiceForm.invoiceNumber.trim() || inv.invoiceNo,
                date: addInvoiceForm.invoiceDate || inv.date,
                customer: addInvoiceForm.customer,
                opportunityOrder: addInvoiceForm.opportunityOrder,
                referenceNumber: addInvoiceForm.referenceNumber,
                lpoDate: addInvoiceForm.lpoDate,
                lpoNumber: addInvoiceForm.lpoNumber,
                paymentLocation: addInvoiceForm.paymentLocation,
                attention: addInvoiceForm.attention,
                description: addInvoiceForm.description,
                nextFollowup: addInvoiceForm.invoiceDueDate || inv.nextFollowup,
                rawAmount: rawAmt,
                rawPaid: advPaid,
                amount: `AED ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                paid: `AED ${advPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                balance: `AED ${balanceVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                status: status,
                invoiceType: addInvoiceForm.invoiceType,
                products: addInvoiceForm.products || []
              }
            : inv
        )
      );
      toast.success(`Tax Invoice "${addInvoiceForm.invoiceNumber}" updated successfully!`);
      setEditingInvoiceId(null);
      setViewMode('list');
      return;
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    toast.success(`Tax Invoice "${newInvoice.invoiceNo}" generated successfully!`);
    setViewMode('list');

    // Reset and bump sequence
    setAddInvoiceForm((prev) => ({
      ...prev,
      invoiceNumber: `CTINV#${15260 + invoices.length}`,
      amount: '',
      discount: '',
      adjustment: '',
      advancePaid: '0.00',
      description: '',
      referenceNumber: '',
      lpoNumber: '',
      documentFileName: '',
      products: []
    }));
  };

  const handleOpenEdit = (item) => {
    setActiveActionId(null);
    setSelectedInvoiceDetail(null);
    setEditingInvoiceId(item.id);

    const cleanAmt = parseFloat(String(item.rawAmount ?? item.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;
    const cleanAdv = parseFloat(String(item.rawPaid ?? item.paid ?? '0').replace(/[^0-9.]/g, '')) || 0;

    setAddInvoiceForm({
      invoiceNumber: item.invoiceNo || 'CTINV#15259',
      customer: item.customer || '',
      opportunityOrder: item.opportunityOrder || '',
      lpoDate: item.lpoDate || '',
      referenceNumber: item.referenceNumber || item.opportunityOrder || '',
      amount: cleanAmt > 0 ? String(cleanAmt.toFixed(2)) : '0.00',
      vatRate: item.vatRate || '5',
      paymentLocation: item.paymentLocation || '',
      invoiceDate: item.date || '16-11-2026',
      invoiceDueDate: item.nextFollowup || '',
      lpoNumber: item.lpoNumber || '',
      invoiceType: item.invoiceType || 'Standard Tax Invoice',
      vatType: item.vatType || 'With VAT',
      documentFileName: item.documentFileName || '',
      discount: item.discount || '',
      adjustment: item.adjustment || '',
      advancePaid: cleanAdv > 0 ? String(cleanAdv.toFixed(2)) : '0.00',
      attention: item.attention || '',
      description: item.description || '',
      addReceipt: false,
      addPaymentFollowup: false,
      products: item.products && item.products.length > 0 ? item.products : []
    });

    setViewMode('create');
  };

  const handleDelete = (id, no) => {
    const updated = invoices.filter((i) => i.id !== id && i.invoiceNo !== no);
    setInvoices(updated);
    try {
      localStorage.setItem('alzaydan_crm_invoices', JSON.stringify(updated));
      const deleted = JSON.parse(localStorage.getItem('alzaydan_deleted_inv_ids') || '[]');
      if (id && !deleted.includes(id)) deleted.push(id);
      if (no && !deleted.includes(no)) deleted.push(no);
      localStorage.setItem('alzaydan_deleted_inv_ids', JSON.stringify(deleted));
      window.dispatchEvent(new Event('alzaydan_sales_sync'));
    } catch {}
    toast.success(`Invoice ${no || ''} deleted.`);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TIER 1: ADD / EDIT INVOICE VIEW                                */}
      {/* ============================================================== */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Header: 📄 Add/Edit Invoice | Red [X] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{editingInvoiceId ? 'Edit Invoice' : 'Add Invoice'}</span>
              {editingInvoiceId && (
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {addInvoiceForm.invoiceNumber}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingInvoiceId(null);
                setViewMode('list');
              }}
              className="w-6 h-6 rounded-md bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Close and return to invoices list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Sub-header Section: 📄 Invoice Details */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100/80">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Invoice Details</span>
          </div>

          <form onSubmit={handleAddInvoiceSubmit} className="space-y-6 text-xs">
            {/* 2-Column Responsive Form Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Invoice Number * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={addInvoiceForm.invoiceNumber}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, invoiceNumber: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Tax Invoice sequence: CTINV# active')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-[#0284C7] cursor-pointer"
                      title="Sequence Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Customer * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Customer <span className="text-rose-500">*</span>
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
                    value={addInvoiceForm.customer}
                    onChange={(e) => handleCustomerSelectInInvoice(e.target.value)}
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

                {/* 3. Opportunity/Order * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Opportunity / Order / Quotation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addInvoiceForm.opportunityOrder}
                    onChange={(e) => handleOrderSelectInInvoice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                  >
                    <option value="">Select Sales Order / Quotation / Opportunity</option>
                    <optgroup label="Sales Orders">
                      {availableOrders.map((o) => {
                        const val = o.orderNo || o.orderNumber;
                        const label = `${val} - ${o.opportunity || 'Order'} (${o.customer || o.customerName || 'Client'})`;
                        return (
                          <option key={`order-inv-${val}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </optgroup>
                    <optgroup label="Quotations">
                      {availableQuotations.map((q) => {
                        const val = q.quotationNo || q.quotationNumber;
                        const label = `${val} - ${q.opportunity || 'Quotation'} (${q.customer || q.customerName || 'Client'})`;
                        return (
                          <option key={`quot-inv-${val}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </optgroup>
                    <optgroup label="Opportunities">
                      {availableOpportunities.map((opp) => {
                        const val = opp.code || opp.opportunityNumber || opp.name;
                        const label = `${opp.code ? `${opp.code} - ` : ''}${opp.name} (${opp.customer || 'Client'})`;
                        return (
                          <option key={`opp-inv-${val}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                </div>

                {/* 4. LPO Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={addInvoiceForm.lpoDate}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, lpoDate: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 5. Reference Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={addInvoiceForm.referenceNumber}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, referenceNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 6. Amount * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Amount <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0.00"
                    value={addInvoiceForm.amount}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
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
                        value={addInvoiceForm.vatRate}
                        onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, vatRate: e.target.value })}
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

                {/* 8. Total */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={calculatedTotalAmount > 0 ? calculatedTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    className="w-full px-3.5 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 outline-none cursor-not-allowed"
                  />
                </div>

                {/* 9. Payment Location */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <label className="text-xs font-semibold text-slate-700">Payment Location</label>
                  </div>
                  <input
                    type="text"
                    placeholder="Search location"
                    value={addInvoiceForm.paymentLocation}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, paymentLocation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-4">
                {/* 1. Invoice Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addInvoiceForm.invoiceDate}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, invoiceDate: e.target.value })}
                      placeholder="06-10-2026"
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Invoice Due Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={addInvoiceForm.invoiceDueDate}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, invoiceDueDate: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. LPO Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    LPO Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter LPO Number"
                    value={addInvoiceForm.lpoNumber}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, lpoNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 4. Invoice Type (Side-by-side selects) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={addInvoiceForm.invoiceType}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, invoiceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="File Upload">File Upload</option>
                      <option value="Standard Tax Invoice">Standard Tax Invoice</option>
                      <option value="Advance Invoice">Advance Invoice</option>
                      <option value="Retention Invoice">Retention Invoice</option>
                      <option value="Commercial Invoice">Commercial Invoice</option>
                    </select>
                    <select
                      value={addInvoiceForm.vatType}
                      onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, vatType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] cursor-pointer"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                    </select>
                  </div>
                </div>

                {/* 5. Document */}
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
                            setAddInvoiceForm({ ...addInvoiceForm, documentFileName: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {addInvoiceForm.documentFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                {/* 6. Discount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addInvoiceForm.discount}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, discount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 7. Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adjustment
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addInvoiceForm.adjustment}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, adjustment: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 8. Advance Paid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Advance Paid
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={addInvoiceForm.advancePaid}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, advancePaid: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 9. Attention */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Attention
                  </label>
                  <input
                    type="text"
                    placeholder="Attention to Accounts / Finance"
                    value={addInvoiceForm.attention}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, attention: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                  />
                </div>

                {/* 10. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter invoice description or scope..."
                    value={addInvoiceForm.description}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Products / Items Details (Inherited from Opportunity / Quotation / Order) */}
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Products / Items Details</span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    (Auto-filled from Opportunity / Quotation / Sales Order)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddProductRow}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-blue-600 flex items-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              {(!addInvoiceForm.products || addInvoiceForm.products.length === 0) ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Select a Customer or Opportunity/Order above to auto-fill product items, or click "Add Item".
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full min-w-[750px] text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Brand</th>
                        <th className="py-2.5 px-3 text-center w-20">QTY</th>
                        <th className="py-2.5 px-3 text-right w-28">Unit Price (AED)</th>
                        <th className="py-2.5 px-3 text-right w-28">Total (AED)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {addInvoiceForm.products.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={p.itemName || ''}
                              onChange={(e) => handleProductChange(idx, 'itemName', e.target.value)}
                              placeholder="Item Name"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={p.itemCode || ''}
                              onChange={(e) => handleProductChange(idx, 'itemCode', e.target.value)}
                              placeholder="Code"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={p.brand || ''}
                              onChange={(e) => handleProductChange(idx, 'brand', e.target.value)}
                              placeholder="Brand"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={p.quantity || 1}
                              onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={p.price || ''}
                              onChange={(e) => handleProductChange(idx, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-mono text-slate-800 outline-none focus:bg-white focus:border-[#011635]"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                            {(parseFloat(p.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProductRow(idx)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-xs">
                        <td colSpan={5} className="py-2 px-3 text-right text-slate-600">
                          Actual Price:
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-900">
                          AED {(parseFloat(addInvoiceForm.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="bg-slate-50/80 font-bold text-xs">
                        <td colSpan={5} className="py-1.5 px-3 text-right text-slate-500 font-medium">
                          5% UAE VAT:
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-slate-700">
                          AED {calculatedVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="bg-blue-50/70 font-extrabold text-xs text-blue-900 border-t border-blue-100">
                        <td colSpan={5} className="py-2 px-3 text-right text-blue-900">
                          Total Invoice Amount:
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-blue-900 text-sm">
                          AED {calculatedTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Actions Row: Checkboxes on Left | Buttons on Right */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addInvoiceForm.addReceipt}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, addReceipt: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">Add Receipt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addInvoiceForm.addPaymentFollowup}
                    onChange={(e) => setAddInvoiceForm({ ...addInvoiceForm, addPaymentFollowup: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">Add Payment Followup</span>
                </label>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#011635] hover:bg-[#07244a] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  {editingInvoiceId ? 'Update Invoice' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingInvoiceId(null);
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
      {/* TIER 2: TAX INVOICE LIST VIEW (Matching Reference Image 2)     */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <>
          {/* ============================================================== */}
          {/* 1. TOP SUB-RIBBON TABS: [📄 Invoice]  [📋 Payment Followup]    */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab('Invoice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === 'Invoice'
                  ? 'bg-white border border-slate-300 text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('Payment Followup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === 'Payment Followup'
                  ? 'bg-white border border-slate-300 text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Payment Followup</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. TOP FILTER CARD (Matching Image 2: 3 Rows)                  */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Row 1: Select Owner | Invoice Date | Customer | Opportunity/Order */}
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
                  Invoice Date
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
                  Customer
                </label>
                <select
                  value={filterCustomer}
                  onChange={(e) => { setFilterCustomer(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Customer">Select Customer</option>
                  {availableCustomers.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Opportunity/Order
                </label>
                <select
                  value={filterOppOrder}
                  onChange={(e) => { setFilterOppOrder(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Opportunity/Order">Select Opportunity/Order</option>
                  {oppOrderOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Business Opportunity | Product/Service | Payment Status | Invoice Type */}
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
                  <option value="Expansion">Expansion</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Product/Service
                </label>
                <select
                  value={filterProductService}
                  onChange={(e) => { setFilterProductService(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Product/Service">Select Product/Service</option>
                  <option value="Fleet Maintenance">Fleet Maintenance</option>
                  <option value="Chiller Installation">Chiller Installation</option>
                  <option value="HVAC Cold Storage">HVAC Cold Storage</option>
                  <option value="Chemical Feedstock">Chemical Feedstock</option>
                  <option value="Commercial Technical Services">Commercial Technical Services</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Payment Status
                </label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => { setFilterPaymentStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Invoice Type
                </label>
                <select
                  value={filterInvoiceType}
                  onChange={(e) => { setFilterInvoiceType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="Select Invoice Type">Select Invoice Type</option>
                  <option value="Standard Tax Invoice">Standard Tax Invoice</option>
                  <option value="Advance Invoice">Advance Invoice</option>
                  <option value="Retention Invoice">Retention Invoice</option>
                  <option value="File Upload">File Upload</option>
                </select>
              </div>
            </div>

            {/* Row 3: Order Type + Reset Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Order Type
                </label>
                <select
                  value={filterOrderType}
                  onChange={(e) => { setFilterOrderType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none cursor-pointer text-slate-800"
                >
                  <option value="All">All</option>
                  <option value="Supply">Supply</option>
                  <option value="Fit Out">Fit Out</option>
                  <option value="Installation">Installation</option>
                  <option value="Projects">Projects</option>
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
          {/* 3. TABLE CONTAINER (Matching Image 2: 📄 Invoice + [+ INVOICE])*/}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Action Header: 📄 Invoice + [+ INVOICE] */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Invoice
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingInvoiceId(null);
                  setAddInvoiceForm({
                    invoiceNumber: `CTINV#${15260 + invoices.length}`,
                    customer: '',
                    opportunityOrder: '',
                    lpoDate: '',
                    referenceNumber: '',
                    amount: '',
                    vatRate: '5',
                    paymentLocation: '',
                    invoiceDate: '16-11-2026',
                    invoiceDueDate: '',
                    lpoNumber: '',
                    invoiceType: 'Standard Tax Invoice',
                    vatType: 'With VAT',
                    documentFileName: '',
                    discount: '',
                    adjustment: '',
                    advancePaid: '0.00',
                    attention: '',
                    description: '',
                    addReceipt: false,
                    addPaymentFollowup: false,
                    products: []
                  });
                  setViewMode('create');
                }}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ INVOICE</span>
              </button>
            </div>

            {/* Sub-bar: Shows [10 ▾] Rows & Search Invoice */}
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
                  placeholder="Search Invoice"
                  className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#011635] outline-none text-slate-800 w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Table (Columns: Sl No., Date ▾, Owner, Invoice No., Opportunity/Order, Customer, Next Followup, Amount, Paid, Balance, Status, Action) */}
            <div className="overflow-x-auto min-h-[360px] pb-16">
              <table className="w-full min-w-[1100px] text-left text-xs">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-3">Sl No.</th>
                    <th className="py-3 px-3">Date ▾</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Invoice No.</th>
                    <th className="py-3 px-3">Opportunity/Order</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Next Followup</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Paid</th>
                    <th className="py-3 px-3">Balance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center text-slate-400 font-medium text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileText className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                          <span className="font-bold text-slate-600">No invoices found.</span>
                          <span className="text-[11px] text-slate-400">Click '+ INVOICE' above to generate a new tax invoice.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 font-bold text-[11px]">
                          {String((currentPage - 1) * rowsPerPage + idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {item.date}
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
                        <td className="py-3 px-3 font-mono font-bold text-blue-600 text-xs">
                          {item.invoiceNo}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px] max-w-[130px] truncate" title={item.opportunityOrder}>
                          {item.opportunityOrder}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-[150px] truncate" title={item.customer}>
                          {item.customer}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {item.nextFollowup}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {item.amount}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-600 font-medium">
                          {item.paid}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-600">
                          {item.balance}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'Partially Paid'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                              title="Actions"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionId === item.id && (
                              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 z-30 py-2 px-1 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoiceDetail(item);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.success(`Printing Tax Invoice ${item.invoiceNo}...`);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 font-medium transition cursor-pointer"
                                >
                                  <Printer className="w-4 h-4 text-slate-600 stroke-[1.8]" />
                                  <span>Print</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDelete(item.id, item.invoiceNo);
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
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  &laquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentPage === pg
                        ? 'bg-[#00875A] text-white'
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
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL: VIEW INVOICE DETAIL ================= */}
      {selectedInvoiceDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedInvoiceDetail.invoiceNo}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AL ZAYDAN INTERNATIONAL FZE &bull; Tax Invoice Details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Header Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-800">{selectedInvoiceDetail.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Opportunity/Order:</span>
                  <span className="font-semibold text-slate-700">{selectedInvoiceDetail.opportunityOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference Number:</span>
                  <span className="font-mono font-bold text-blue-600">{selectedInvoiceDetail.referenceNumber || selectedInvoiceDetail.opportunityOrder || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-mono text-slate-700">{selectedInvoiceDetail.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attention:</span>
                  <span className="font-medium text-slate-700">{selectedInvoiceDetail.attention || 'Mr. shemeem'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Location:</span>
                  <span className="font-medium text-slate-700">{selectedInvoiceDetail.paymentLocation || 'Mussafah, Abu Dhabi'}</span>
                </div>
                {selectedInvoiceDetail.description && (
                  <div className="sm:col-span-2 flex flex-col gap-0.5 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 text-[11px]">Description:</span>
                    <span className="text-slate-700 font-medium">{selectedInvoiceDetail.description}</span>
                  </div>
                )}
              </div>

              {/* Products Table */}
              {selectedInvoiceDetail.products && selectedInvoiceDetail.products.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-100/70 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>Products / Items Details</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedInvoiceDetail.products.length} {selectedInvoiceDetail.products.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                          <th className="py-2 px-3">Item Name</th>
                          <th className="py-2 px-3">Code</th>
                          <th className="py-2 px-3">Brand</th>
                          <th className="py-2 px-3 text-center">QTY</th>
                          <th className="py-2 px-3 text-right">Unit Price (AED)</th>
                          <th className="py-2 px-3 text-right">Total (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedInvoiceDetail.products.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-900">{p.itemName || '—'}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{p.itemCode || '—'}</td>
                            <td className="py-2 px-3 text-slate-700">{p.brand || '—'}</td>
                            <td className="py-2 px-3 text-center font-bold text-slate-800">{p.quantity || 1}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700">
                              {(parseFloat(p.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                              {(parseFloat(p.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Overview Amount Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actual Price</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    AED {(parseFloat(selectedInvoiceDetail.rawAmount) || 2000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">VAT (5%)</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    AED {((parseFloat(selectedInvoiceDetail.rawAmount) || 2000) * 0.05).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider">Total Invoice</span>
                  <span className="text-xs font-mono font-extrabold text-blue-900">
                    {selectedInvoiceDetail.amount}
                  </span>
                </div>
              </div>

              {/* Status and Balance Box */}
              <div className="p-3 bg-blue-50/50 rounded-xl space-y-1.5 border border-blue-100">
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Status:</span>
                  <span className="font-bold text-amber-700">{selectedInvoiceDetail.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Paid:</span>
                  <span className="font-mono text-emerald-600 font-bold">{selectedInvoiceDetail.paid || 'AED 0.00'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200/60">
                  <span className="font-bold text-slate-900">Outstanding Balance:</span>
                  <span className="font-mono font-extrabold text-rose-600 text-sm">{selectedInvoiceDetail.balance || selectedInvoiceDetail.amount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
              <span className="text-[11px] text-slate-400 font-medium">
                support: shemin@alzaydanfze.com
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceDetail(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = selectedInvoiceDetail;
                    setSelectedInvoiceDetail(null);
                    handleOpenEdit(itemToEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Tax Invoice ${selectedInvoiceDetail.invoiceNo} emailed to accounts.`);
                    setSelectedInvoiceDetail(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#011635] hover:bg-[#07244a] text-white font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Email Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
