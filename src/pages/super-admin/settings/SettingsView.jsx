import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  ShieldCheck,
  Bell,
  Save,
  RotateCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Percent,
  Sliders
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'general' | 'fiscal' | 'rbac' | 'security'

  // General Settings State
  const [generalForm, setGeneralForm] = useState({
    companyName: 'Al Zaydan International FZE',
    tradeLicense: 'FZE-DXB-883921-2026',
    trnNumber: '100234567800003',
    industry: 'Commercial Air Conditioning & Industrial Cooling Systems',
    chamberNo: '349120',
    address: 'Business Center 4, Level 5, JAFZA One, Jebel Ali Free Zone, Dubai, UAE',
    email: 'info@alzaydan.ae',
    phone: '+971 4 881 9900',
    website: 'https://www.alzaydan.ae',
    workingHours: 'Mon - Sat: 08:00 AM - 06:00 PM (GST)'
  });

  // Fiscal Currency & Tax State
  const [fiscalForm, setFiscalForm] = useState({
    baseCurrency: 'AED (United Arab Emirates Dirham)',
    vatRate: '5.0',
    usdRate: '3.6725',
    sarRate: '0.9790',
    eurRate: '3.9850',
    gbpRate: '4.6520',
    decimalPlaces: '2 Decimals (0.00)',
    autoCalculateVat: true,
    oppPrefix: 'OPP-2026-',
    coPrefix: 'CO-2026-',
    soPrefix: 'SO-2026-',
    invPrefix: 'INV-2026-',
    recPrefix: 'REC-2026-',
    dnPrefix: 'DN-2026-'
  });

  // Roles & Permissions State
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [permissions, setPermissions] = useState({
    'Super Admin': {
      dashboardView: true,
      dashboardExport: true,
      tasksManage: true,
      leadsManage: true,
      leadsExport: true,
      customersManage: true,
      customersCredit: true,
      salesCreate: true,
      salesApprove: true,
      salesDiscount: true,
      invoicesIssue: true,
      receiptsAccept: true,
      deliveryDispatch: true,
      reportsRun: true,
      reportsCustomize: true,
      settingsModify: true
    },
    'Sales Manager': {
      dashboardView: true,
      dashboardExport: true,
      tasksManage: true,
      leadsManage: true,
      leadsExport: true,
      customersManage: true,
      customersCredit: true,
      salesCreate: true,
      salesApprove: true,
      salesDiscount: true,
      invoicesIssue: true,
      receiptsAccept: true,
      deliveryDispatch: true,
      reportsRun: true,
      reportsCustomize: true,
      settingsModify: false
    },
    'Team Lead': {
      dashboardView: true,
      dashboardExport: false,
      tasksManage: true,
      leadsManage: true,
      leadsExport: false,
      customersManage: true,
      customersCredit: false,
      salesCreate: true,
      salesApprove: false,
      salesDiscount: false,
      invoicesIssue: true,
      receiptsAccept: true,
      deliveryDispatch: true,
      reportsRun: true,
      reportsCustomize: false,
      settingsModify: false
    },
    'Sales Executive': {
      dashboardView: true,
      dashboardExport: false,
      tasksManage: true,
      leadsManage: true,
      leadsExport: false,
      customersManage: true,
      customersCredit: false,
      salesCreate: true,
      salesApprove: false,
      salesDiscount: false,
      invoicesIssue: false,
      receiptsAccept: true,
      deliveryDispatch: false,
      reportsRun: false,
      reportsCustomize: false,
      settingsModify: false
    }
  });

  // Security & Notifications State
  const [securityForm, setSecurityForm] = useState({
    sessionTimeout: '30 Minutes',
    twoFactorAuth: true,
    whatsappAlerts: true,
    emailAlerts: true,
    highValueLeadNotification: true,
    overduePaymentAlert: true,
    deliveryConfirmNotification: true
  });

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    toast.success('System settings saved successfully!');
  };

  const handleResetDefaults = () => {
    toast.info('Settings reset to system default parameters');
  };

  const togglePermission = (permKey) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [permKey]: !prev[selectedRole][permKey]
      }
    }));
  };

  return (
    <div className="space-y-5">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & QUICK SECTION PILLS                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Settings &amp; Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company profile, fiscal currency (AED / VAT), and role permissions in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Settings', icon: Sliders },
          { id: 'general', label: 'General & Company', icon: Building2 },
          { id: 'fiscal', label: 'Fiscal Currency & VAT (AED)', icon: DollarSign },
          { id: 'rbac', label: 'Roles & Permissions', icon: ShieldCheck },
          { id: 'security', label: 'Notifications & Security', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#011635] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. SECTION 1: GENERAL & COMPANY PROFILE                        */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'general') && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Company &amp; Legal Entity Information
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              FTA Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Company Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Legal Company Name</label>
              <input
                type="text"
                value={generalForm.companyName}
                onChange={(e) => setGeneralForm({ ...generalForm, companyName: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* TRN Number */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">UAE Tax Registration No. (TRN)</label>
              <input
                type="text"
                value={generalForm.trnNumber}
                onChange={(e) => setGeneralForm({ ...generalForm, trnNumber: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Trade License */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Trade License No.</label>
              <input
                type="text"
                value={generalForm.tradeLicense}
                onChange={(e) => setGeneralForm({ ...generalForm, tradeLicense: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Contact Email</span>
              </label>
              <input
                type="email"
                value={generalForm.email}
                onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Telephone</span>
              </label>
              <input
                type="text"
                value={generalForm.phone}
                onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
              </label>
              <input
                type="text"
                value={generalForm.website}
                onChange={(e) => setGeneralForm({ ...generalForm, website: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Registered Headquarters Address</span>
              </label>
              <input
                type="text"
                value={generalForm.address}
                onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 2: FISCAL CURRENCY & TAX (AED)                      */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'fiscal') && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Fiscal Currency, VAT &amp; Document Numbering Series
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              GCC Regional Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Base Currency */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Primary Commercial Currency</label>
              <input
                type="text"
                value={fiscalForm.baseCurrency}
                readOnly
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-not-allowed"
              />
            </div>

            {/* VAT Rate */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-slate-400" />
                <span>UAE VAT Standard Rate</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={fiscalForm.vatRate}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, vatRate: e.target.value })}
                  className="w-full h-9 px-3 pr-7 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* USD Exchange Rate */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">USD Peg (1 USD to AED)</label>
              <input
                type="text"
                value={fiscalForm.usdRate}
                onChange={(e) => setFiscalForm({ ...fiscalForm, usdRate: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* SAR Exchange Rate */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">SAR Peg (1 SAR to AED)</label>
              <input
                type="text"
                value={fiscalForm.sarRate}
                onChange={(e) => setFiscalForm({ ...fiscalForm, sarRate: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document Numbering Prefixes */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Automated Numbering Prefixes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Opportunity</span>
                <input
                  type="text"
                  value={fiscalForm.oppPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, oppPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Offer</span>
                <input
                  type="text"
                  value={fiscalForm.coPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, coPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-amber-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Sales Order</span>
                <input
                  type="text"
                  value={fiscalForm.soPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, soPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-purple-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Tax Invoice</span>
                <input
                  type="text"
                  value={fiscalForm.invPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, invPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Receipt</span>
                <input
                  type="text"
                  value={fiscalForm.recPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, recPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Delivery Note</span>
                <input
                  type="text"
                  value={fiscalForm.dnPrefix}
                  onChange={(e) => setFiscalForm({ ...fiscalForm, dnPrefix: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-teal-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SECTION 3: ROLES & PERMISSIONS (RBAC)                       */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'rbac') && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-purple-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Role-Based Access Control (RBAC)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Configure operational module permissions for each user tier
                </p>
              </div>
            </div>

            {/* Role Switcher Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['Super Admin', 'Sales Manager', 'Team Lead', 'Sales Executive'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === role
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Permission Grid */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Module / Feature</th>
                  <th className="py-2.5 px-3.5">Operational Scope</th>
                  <th className="py-2.5 px-3.5 text-center w-28">Current Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { key: 'dashboardView', label: 'Dashboard & KPI Analytics', desc: 'View executive revenue figures and pipeline KPIs' },
                  { key: 'tasksManage', label: 'Task Management', desc: 'Create, assign, and update commercial tasks' },
                  { key: 'leadsManage', label: 'Commercial Leads', desc: 'View, qualify, and reassign incoming sales inquiries' },
                  { key: 'customersManage', label: 'Enterprise Accounts', desc: 'Manage client companies, credit terms, and contacts' },
                  { key: 'salesCreate', label: 'Commercial Offers & Orders', desc: 'Draft quotations and process sales orders' },
                  { key: 'salesDiscount', label: 'Commercial Discount Override', desc: 'Authorize pricing discounts beyond standard tier' },
                  { key: 'invoicesIssue', label: 'Tax Invoices & Receipts', desc: 'Issue official UAE VAT tax invoices and vouchers' },
                  { key: 'deliveryDispatch', label: 'Delivery Notes & Logistics', desc: 'Generate consignment slips and gate passes' },
                  { key: 'reportsRun', label: 'Business Intelligence Reports', desc: 'Run performance, margin, and aging matrix reports' },
                  { key: 'settingsModify', label: 'System Configuration', desc: 'Modify company profile, fiscal currencies, and permissions' }
                ].map((row) => {
                  const isEnabled = permissions[selectedRole]?.[row.key];
                  return (
                    <tr key={row.key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-slate-800">{row.label}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">{row.desc}</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(row.key)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SECTION 4: NOTIFICATIONS & SECURITY                         */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'security') && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Notifications, WhatsApp Alerts &amp; Security Sessions
              </h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              WhatsApp API Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* WhatsApp Integration Box */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Automated Dispatch &amp; Alerts</h3>
              <div className="space-y-2">
                {[
                  { key: 'highValueLeadNotification', label: 'Alert for High-Value Leads (> AED 200,000)' },
                  { key: 'overduePaymentAlert', label: 'Overdue Tax Invoice Payment Followup Notice' },
                  { key: 'deliveryConfirmNotification', label: 'Goods Delivery Consignment Dispatch Alert' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={securityForm[item.key]}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, [item.key]: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Security Policies */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Session &amp; Authentication Control</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Session Idle Timeout</span>
                  <select
                    value={securityForm.sessionTimeout}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })
                    }
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="4 Hours">4 Hours</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={securityForm.twoFactorAuth}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, twoFactorAuth: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enforce Two-Factor Authentication (2FA) for Executive Roles</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
