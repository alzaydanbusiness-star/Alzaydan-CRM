import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
  X,
  Plus,
  Target,
  Bell,
  Package
} from 'lucide-react';

import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import SummaryCards from './overview/SummaryCards';
import CommercialPipelineBar from './overview/CommercialPipelineBar';
import RecentLeads from './overview/RecentLeads';
import PendingTasks from './overview/PendingTasks';
import AddEmployeeModal from './overview/AddEmployeeModal';
import SalesView from './sales/SalesView';
import CreateSalesModal from './sales/CreateSalesModal';
import { normalizeOpportunity } from '../../utils/salesUtils';
import TaskManager from './tasks/TaskManager';
import LeadManager from './leads/LeadManager';
import CustomerManager from './customers/CustomerManager';
import ReportManager from './reports/ReportManager';
import UsersDirectoryView from './users/UsersDirectoryView';
import SettingsView from './settings/SettingsView';
import { getStoredUsers, isSalesExecutive, filterTasksByRole } from '../../utils/userDirectory';

export default function SuperAdminDashboard({
  initialNav = 'Dashboard',
  initialCustomerSubTab = 'Customer',
  initialSalesSubTab = 'Opportunity'
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('alzaydan_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Authentication Guard: Redirect to /login if user is not authenticated
  useEffect(() => {
    const stored = localStorage.getItem('alzaydan_current_user');
    if (!stored) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('alzaydan_current_user');
        if (stored) setCurrentUser(JSON.parse(stored));
        setEmployees(getStoredUsers());
        const savedTasks = localStorage.getItem('alzaydan_crm_task_list');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch {}
    };
    window.addEventListener('alzaydan_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isRep = isSalesExecutive(currentUser);

  // Navigation & UI State
  const [activeNav, setActiveNav] = useState(() => {
    if (isSalesExecutive(currentUser) && (initialNav === 'Employees' || initialNav === 'Users')) {
      return 'Dashboard';
    }
    return initialNav;
  });

  // Guard against Sales Executives accessing /employees or /users
  useEffect(() => {
    if (isRep && (activeNav === 'Employees' || activeNav === 'Users' || location.pathname === '/employees' || location.pathname === '/users')) {
      setActiveNav('Dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isRep, activeNav, location.pathname, navigate]);

  useEffect(() => {
    const routeByNav = {
      Dashboard: '/dashboard',
      Tasks: '/tasks',
      Leads: '/leads',
      Customers: '/customers',
      Employees: '/employees',
      Users: '/users',
      Sales: '/sales',
      Reports: '/reports'
    };
    const targetPath = routeByNav[activeNav];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [activeNav, location.pathname, navigate]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesSubTab, setSalesSubTab] = useState(initialSalesSubTab);
  const [customerSubTab, setCustomerSubTab] = useState(initialCustomerSubTab);

  // Interactive Live Data States (Initialized safely, preserving existing user data)
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_task_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_leads');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [_activities, setActivities] = useState([]);
  const [employees, setEmployees] = useState(() => getStoredUsers());
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_customers');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_opportunities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeOpportunity).filter(Boolean);
        }
      }
    } catch {}
    return [];
  });
  const [salesTransactions, setSalesTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('alzaydan_crm_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Sync state to localStorage safely (persisting empty list when items are deleted)
  useEffect(() => {
    if (Array.isArray(leads)) {
      try {
        localStorage.setItem('alzaydan_crm_leads', JSON.stringify(leads));
      } catch {}
    }
  }, [leads]);

  useEffect(() => {
    if (Array.isArray(opportunities)) {
      try {
        localStorage.setItem('alzaydan_crm_opportunities', JSON.stringify(opportunities));
      } catch {}
    }
  }, [opportunities]);

  useEffect(() => {
    if (Array.isArray(customers)) {
      try {
        localStorage.setItem('alzaydan_crm_customers', JSON.stringify(customers));
      } catch {}
    }
  }, [customers]);

  // Synchronize in-memory Dashboard state when leads or customers are updated/deleted elsewhere
  useEffect(() => {
    const handleLeadSync = () => {
      try {
        const saved = localStorage.getItem('alzaydan_crm_leads');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setLeads(parsed);
        }
      } catch {}
    };
    const handleCustSync = () => {
      try {
        const saved = localStorage.getItem('alzaydan_crm_customers');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setCustomers(parsed);
        }
      } catch {}
    };
    window.addEventListener('alzaydan_lead_updated', handleLeadSync);
    window.addEventListener('alzaydan_customer_updated', handleCustSync);
    return () => {
      window.removeEventListener('alzaydan_lead_updated', handleLeadSync);
      window.removeEventListener('alzaydan_customer_updated', handleCustSync);
    };
  }, []);

  // Modal States for Quick Actions
  const [activeModal, setActiveModal] = useState(null); // 'add-employee' | 'create-lead' | 'add-customer' | 'create-task'
  const [isCreateSalesModalOpen, setIsCreateSalesModalOpen] = useState(false);
  const [salesCreateType, setSalesCreateType] = useState('Opportunity');
  const [tempName, setTempName] = useState('');
  const [tempCompany, setTempCompany] = useState('');
  const [tempAssignee, setTempAssignee] = useState('');

  // Task Toggle Handler
  const handleToggleTask = (taskId) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, status: !t.completed ? 'Completed' : 'Pending' }
          : t
      );
      try {
        localStorage.setItem('alzaydan_crm_task_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Full Employee Registration Handler
  const handleAddNewEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'New employee added',
        desc: `${newEmp.name} joined as ${newEmp.position}`,
        time: 'Just now',
        iconType: 'user-plus',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50'
      },
      ...prev
    ]);
  };

  const handleCreateLeadSubmit = (e) => {
    e.preventDefault();
    if (!tempName.trim() || !tempCompany.trim()) return;

    const newLead = {
      id: Date.now(),
      name: tempName.trim(),
      company: tempCompany.trim(),
      status: 'New',
      statusColor: 'bg-blue-50 text-blue-600 border-blue-200',
      assignedTo: 'Muhammed K',
      assignedInitials: 'MK',
      avatarBg: 'bg-emerald-600 text-white'
    };

    setLeads((prev) => [newLead, ...prev]);
    toast.success(`Lead for "${newLead.company}" created and assigned!`);
    setTempName('');
    setTempCompany('');
    setActiveModal(null);
  };

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!tempCompany.trim()) return;

    const newCust = {
      id: Date.now(),
      name: tempCompany.trim(),
      contact: tempName.trim() || 'Director',
      industry: 'Commercial Trading',
      country: 'UAE, Dubai',
      value: '$300,000',
      status: 'Active'
    };

    setCustomers((prev) => [newCust, ...prev]);
    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'New customer created',
        desc: newCust.name,
        time: 'Just now',
        iconType: 'user-check',
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50'
      },
      ...prev
    ]);

    toast.success(`Customer "${newCust.name}" onboarded!`);
    setTempName('');
    setTempCompany('');
    setActiveModal(null);
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    const assignedEmp = tempAssignee || employees[0]?.name || 'Super Admin';
    const newTask = {
      id: Date.now(),
      title: tempName.trim(),
      assignedTo: assignedEmp,
      completed: false
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success(`Task created and assigned to ${assignedEmp}!`);
    setTempName('');
    setTempAssignee('');
    setActiveModal(null);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('alzaydan_current_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    toast.success('Signed out from Super Admin Console');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans flex">
      <Toaster position="top-right" richColors />

      {/* Left Sidebar (Matching Reference: Crisp White, Blue Active Item) */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        salesSubTab={salesSubTab}
        setSalesSubTab={setSalesSubTab}
        customerSubTab={customerSubTab}
        setCustomerSubTab={setCustomerSubTab}
      />

      {/* Main Content Area (Offset by Sidebar lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSignOut={handleSignOut}
        />

        {/* Main Canvas Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5">
          {/* Active Navigation: Dashboard Overview */}
          {activeNav === 'Dashboard' && (
            <>
              {/* Row 1: 4 KPI Summary Cards */}
              <SummaryCards
                onSelectMetric={(tab) => setActiveNav(tab)}
                employeesCount={employees.length}
                leadsCount={leads.length}
                customersCount={customers.length}
                salesAmount={0}
                opportunitiesCount={opportunities.length}
                isSalesExecutive={isRep}
              />

              {/* Row 2: Commercial Sales Pipeline by Stage (Matching Reference) */}
              <CommercialPipelineBar onViewFullPipeline={() => setActiveNav('Sales')} />

              {/* Row 3: Recent Leads (7 cols) + Pending Tasks (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7">
                  <RecentLeads
                    leads={leads}
                    onViewAll={() => setActiveNav('Leads')}
                  />
                </div>
                <div className="lg:col-span-5">
                  <PendingTasks
                    tasks={filterTasksByRole(tasks, currentUser)}
                    onToggleTask={handleToggleTask}
                    onViewAll={() => setActiveNav('Tasks')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Active Navigation: Employees / Users Directory View (Matching Reference Image 1 - Restricted to Admin/Manager) */}
          {(activeNav === 'Employees' || activeNav === 'Users') && !isRep && (
            <UsersDirectoryView />
          )}

          {/* Active Navigation: Leads View (Matching Reference Lead Workspace) */}
          {activeNav === 'Leads' && (
            <LeadManager
              leads={leads}
              setLeads={setLeads}
              employees={employees}
              customers={customers}
              setCustomers={setCustomers}
              opportunities={opportunities}
              setOpportunities={setOpportunities}
              initialViewMode="list"
            />
          )}

          {/* Active Navigation: Customers View (Matching Reference Customer & Contact Workspaces) */}
          {activeNav === 'Customers' && (
            <CustomerManager
              activeTab={customerSubTab}
              setActiveTab={setCustomerSubTab}
              employees={employees}
              customers={customers}
              setCustomers={setCustomers}
            />
          )}

          {/* Active Navigation: Tasks View (Matching Reference Enterprise Task Workspace) */}
          {activeNav === 'Tasks' && (
            <TaskManager
              employees={employees}
              customers={customers}
              leads={leads}
            />
          )}

          {/* Active Navigation: Sales View (Opportunities, Quotations, Sales Orders, Tax Invoices) */}
          {activeNav === 'Sales' && (
            <SalesView
              transactions={salesTransactions}
              setTransactions={setSalesTransactions}
              opportunities={opportunities}
              setOpportunities={setOpportunities}
              employees={employees}
              customers={customers}
              leads={leads}
              onOpenCreateModal={(type) => {
                setSalesCreateType(type || 'Opportunity');
                setIsCreateSalesModalOpen(true);
              }}
              activeSubTab={salesSubTab}
              setActiveSubTab={setSalesSubTab}
            />
          )}

          {/* Active Navigation: Targets View */}
          {activeNav === 'Targets' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Enterprise Sales Targets & Quota Allocations</h2>
                </div>
                <button
                  onClick={() => toast.info('Target configuration modal')}
                  className="px-3 py-1.5 bg-[#063056] text-white text-xs font-bold rounded-xl hover:bg-[#083E6E] transition"
                >
                  Adjust Quota
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Commercial Sales Division', target: '$2,400,000', achieved: '$2,100,000', pct: 87.5 },
                  { name: 'Enterprise Key Accounts', target: '$1,200,000', achieved: '$1,280,000', pct: 106.6 },
                  { name: 'Government & Freezone Tenders', target: '$800,000', achieved: '$640,000', pct: 80.0 },
                  { name: 'SME Commercial Fleet', target: '$600,000', achieved: '$520,000', pct: 86.6 }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.name}</span>
                      <span className="text-blue-700">{item.achieved} / {item.target} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-blue-600 to-[#1D4ED8] h-full rounded-full"
                        style={{ width: `${Math.min(100, item.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Navigation: Reports View (Matching Reference Reports UI) */}
          {activeNav === 'Reports' && (
            <ReportManager onBack={() => setActiveNav('Dashboard')} />
          )}{/* Active Navigation: Notifications View */}
          {activeNav === 'Notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">System Notifications & Audits (12 Live)</h2>
                </div>
                <button
                  onClick={() => toast.success('All alerts marked as read')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Mark All Read
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Q4 Enterprise Deal Approved', desc: 'Al Futtaim Logistics contract cleared by executive legal team.', time: '12 min ago' },
                  { title: 'New Sales Lead Assigned', desc: 'Gulf Logistics commercial inquiry routed to Team 1 Alpha.', time: '28 min ago' },
                  { title: 'Quarterly Audit Completed', desc: 'SOC-2 security and database integrity compliance verified.', time: '1 hour ago' },
                  { title: 'New Customer Profile Created', desc: 'Al Noor Trading LLC commercial trading account verified.', time: '2 hours ago' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Navigation: Settings View */}
          {activeNav === 'Settings' && (
            <SettingsView />
          )}

          {/* Active Navigation: Purchase View (Coming Soon) */}
          {activeNav === 'Purchase' && (
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-100 shadow-2xs text-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-xl mx-auto space-y-6 relative z-10">
                {/* Coming Soon Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Module Under Development • Coming Soon</span>
                </div>

                {/* Main Icon & Title */}
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0055D4] flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                    <Package className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Purchase & Procurement
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    This module is currently being finalized. Purchase Orders, Vendor Quotation comparisons, and supplier material intake will be accessible here soon.
                  </p>
                </div>

                {/* Planned Modules Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Purchase Orders (PO)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Multi-tier approval workflows & automated supplier PO generation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Vendor Quotations
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Comparative RFQ analysis and supplier price benchmarks.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Material Cost Tracking
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Live sync with Tax Invoices and job cost accounting.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Supplier Registry
                    </div>
                    <p className="text-[11px] text-slate-500">
                      UAE TRN verified supplier directory and payment terms.
                    </p>
                  </div>
                </div>

                {/* Action / Notification Note */}
                <div className="pt-2">
                  <button
                    onClick={() => toast.success('You will be notified once the Purchase module is live!')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#011635] text-white text-xs font-bold hover:bg-[#022454] transition shadow-md cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    Notify Me When Available
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dedicated Add Employee Modal with Full Profile, Credentials & Position */}
      <AddEmployeeModal
        isOpen={activeModal === 'add-employee'}
        onClose={() => setActiveModal(null)}
        onAddEmployee={handleAddNewEmployee}
      />

      {/* Dedicated Create Sales Document (Opportunity / Quotation / Order / Invoice) Modal */}
      <CreateSalesModal
        isOpen={isCreateSalesModalOpen}
        onClose={() => setIsCreateSalesModalOpen(false)}
        initialType={salesCreateType}
        onAddTransaction={(newTx) => {
          setSalesTransactions((prev) => [newTx, ...prev]);
        }}
        onAddOpportunity={(newOpp) => {
          setOpportunities((prev) => [newOpp, ...prev]);
        }}
        employees={employees}
        customers={customers}
      />

      {/* Modal Dialogs for Other Quick Actions */}
      {activeModal && activeModal !== 'add-employee' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {activeModal === 'create-lead' && 'Create Commercial Lead'}
                {activeModal === 'add-customer' && 'Onboard New Customer'}
                {activeModal === 'create-task' && 'Create & Assign Task'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={
                activeModal === 'create-lead'
                  ? handleCreateLeadSubmit
                  : activeModal === 'add-customer'
                    ? handleAddCustomerSubmit
                    : handleCreateTaskSubmit
              }
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {activeModal === 'create-task' ? 'Task Description' : 'Full Name / Contact'}
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter details..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>

              {(activeModal === 'create-lead' || activeModal === 'add-customer') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Client Name
                  </label>
                  <input
                    type="text"
                    value={tempCompany}
                    onChange={(e) => setTempCompany(e.target.value)}
                    placeholder="e.g. Al Noor Trading LLC"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                  />
                </div>
              )}

              {activeModal === 'create-task' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign to Employee
                  </label>
                  <select
                    value={tempAssignee || employees[0]?.name || ''}
                    onChange={(e) => setTempAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.position || emp.role} • {emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E] shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
