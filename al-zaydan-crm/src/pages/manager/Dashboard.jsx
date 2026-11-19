import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// Layout Components
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

// Super Admin / CEO Standard Modules (Reused for Manager)
import SummaryCards from '../super-admin/overview/SummaryCards';
import CommercialPipelineBar from '../super-admin/overview/CommercialPipelineBar';
import RecentLeads from '../super-admin/overview/RecentLeads';
import PendingTasks from '../super-admin/overview/PendingTasks';
import TaskManager from '../super-admin/tasks/TaskManager';
import LeadManager from '../super-admin/leads/LeadManager';
import CustomerManager from '../super-admin/customers/CustomerManager';
import SalesView from '../super-admin/sales/SalesView';
import CreateSalesModal from '../super-admin/sales/CreateSalesModal';
import UsersDirectoryView from '../super-admin/users/UsersDirectoryView';

// Manager Governance & Approvals Modules
import DealApprovals from './approvals/DealApprovals';
import TeamLeadsManagerView from './teams/TeamLeadsManagerView';
import AddTeamLeadModal from './teams/AddTeamLeadModal';
import TeamLeadActivities from './activities/TeamLeadActivities';
import { getStoredUsers } from '../../utils/userDirectory';

// Mock Data
import {
  initialTeams,
  initialPendingApprovals,
  initialTeamLeadActivities,
  managerNotifications
} from './data/mockData';

export default function ManagerDashboard({
  initialNav = 'Dashboard',
  initialCustomerSubTab = 'Customer',
  initialSalesSubTab = 'Opportunity'
}) {
  const navigate = useNavigate();

  // Navigation State
  const [activeNav, setActiveNav] = useState(initialNav);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesSubTab, setSalesSubTab] = useState(initialSalesSubTab);
  const [customerSubTab, setCustomerSubTab] = useState(initialCustomerSubTab);

  // Modals
  const [isAddTeamLeadOpen, setIsAddTeamLeadOpen] = useState(false);
  const [isCreateSalesModalOpen, setIsCreateSalesModalOpen] = useState(false);
  const [salesCreateType, setSalesCreateType] = useState('Opportunity');
  const [selectedLeadFilter, setSelectedLeadFilter] = useState('All');

  // Logged-in Manager Profile
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('alzaydan_current_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      name: 'Muhammed shemin',
      email: 'shemin@gmail.com',
      role: 'Sales Manager',
      roleTier: 'manager',
      department: 'Sales & Commercial'
    };
  });

  // CRM Shared Datasets
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [salesTransactions, setSalesTransactions] = useState([]);
  const [employees, setEmployees] = useState(() => getStoredUsers());

  // Listen to live user updates from UsersDirectoryView
  useEffect(() => {
    const handleUsersUpdate = () => {
      setEmployees(getStoredUsers());
    };
    window.addEventListener('alzaydan_user_updated', handleUsersUpdate);
    window.addEventListener('storage', handleUsersUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleUsersUpdate);
      window.removeEventListener('storage', handleUsersUpdate);
    };
  }, []);

  // Teams & Team Leads state (initialized from localStorage or initialTeams)
  const [teams, setTeams] = useState(() => {
    try {
      const savedTeams = localStorage.getItem('alzaydan_manager_teams');
      if (savedTeams) {
        return JSON.parse(savedTeams);
      }
    } catch {
      // fallback
    }

    try {
      const customEmps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
      const customLeads = customEmps.filter(
        (u) => (u.roleTier || '').toLowerCase() === 'team-lead' || (u.role || '').toLowerCase() === 'team lead'
      );

      if (customLeads.length > 0) {
        const merged = [...initialTeams];
        customLeads.forEach((lead) => {
          if (!merged.some((t) => t.lead.toLowerCase() === lead.name.toLowerCase() || t.leadEmail?.toLowerCase() === lead.email.toLowerCase())) {
            merged.push({
              id: `team-custom-${lead.id}`,
              name: lead.assignedTeam || `${lead.name}'s Division`,
              lead: lead.name,
              leadEmail: lead.email,
              leadPhone: lead.mobile || lead.phone || '+971 50 123 4567',
              target: Number(lead.target) || 450000,
              closedSales: Number(lead.closedSales) || 0,
              pipelineValue: Number(lead.pipelineValue) || 0,
              dealsCount: Number(lead.dealsCount) || 0,
              winRate: Number(lead.winRate) || 0,
              status: 'Active',
              department: lead.department || 'Commercial Sales',
              executives: []
            });
          }
        });
        return merged;
      }
    } catch {
      // fallback
    }

    return initialTeams;
  });

  // Approvals state
  const [approvals, setApprovals] = useState(() => {
    try {
      const savedApprovals = localStorage.getItem('alzaydan_manager_approvals');
      if (savedApprovals) {
        return JSON.parse(savedApprovals);
      }
    } catch {
      // fallback
    }
    return initialPendingApprovals;
  });

  // Activities state
  const [activities, setActivities] = useState(() => {
    try {
      const savedActivities = localStorage.getItem('alzaydan_manager_activities');
      if (savedActivities) {
        return JSON.parse(savedActivities);
      }
    } catch {
      // fallback
    }
    return initialTeamLeadActivities;
  });

  const [notifications] = useState(managerNotifications);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_manager_approvals', JSON.stringify(approvals));
    } catch {
      // ignore
    }
  }, [approvals]);

  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_manager_teams', JSON.stringify(teams));
    } catch {
      // ignore
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('alzaydan_manager_activities', JSON.stringify(activities));
    } catch {
      // ignore
    }
  }, [activities]);

  // Task Toggle Handler
  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Deal Approval Handlers
  const handleApproveDeal = (dealId) => {
    setApprovals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return { ...deal, status: 'Approved', approvedAt: new Date().toLocaleTimeString() };
      }
      return deal;
    }));

    const targetDeal = approvals.find(d => d.id === dealId);
    if (targetDeal) {
      const newAct = {
        id: `act-appr-${Date.now()}`,
        leadName: targetDeal.repName,
        leadEmail: `${targetDeal.repName.toLowerCase().replace(/\s+/g, '.')}@alzaydan.com`,
        teamName: targetDeal.teamName,
        type: 'approval',
        title: `Manager Approved: ${targetDeal.type}`,
        description: `Manager approved ${targetDeal.type} for ${targetDeal.client} (AED ${targetDeal.dealValue.toLocaleString()}).`,
        timestamp: 'Just now',
        dealValue: `AED ${targetDeal.dealValue.toLocaleString()}`,
        client: targetDeal.client
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  const handleRejectDeal = (dealId, reason) => {
    setApprovals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return { ...deal, status: 'Rejected', rejectReason: reason, rejectedAt: new Date().toLocaleTimeString() };
      }
      return deal;
    }));

    const targetDeal = approvals.find(d => d.id === dealId);
    if (targetDeal) {
      const newAct = {
        id: `act-rej-${Date.now()}`,
        leadName: targetDeal.repName,
        leadEmail: `${targetDeal.repName.toLowerCase().replace(/\s+/g, '.')}@alzaydan.com`,
        teamName: targetDeal.teamName,
        type: 'directive',
        title: `Request Declined: ${targetDeal.type}`,
        description: `Declined with note: "${reason}" for ${targetDeal.client}.`,
        timestamp: 'Just now',
        dealValue: `AED ${targetDeal.dealValue.toLocaleString()}`,
        client: targetDeal.client
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // Add Team Lead handler
  const handleAddTeamLead = (newTeamObject, newTeamLeadEmployee) => {
    setTeams(prev => [newTeamObject, ...prev]);
    setEmployees(prev => [newTeamLeadEmployee, ...prev]);

    const newAct = {
      id: `act-newtl-${Date.now()}`,
      leadName: newTeamObject.lead,
      leadEmail: newTeamObject.leadEmail,
      teamName: newTeamObject.name,
      type: 'assignment',
      title: 'New Team Lead Onboarded',
      description: `Sales Manager onboarded ${newTeamObject.lead} to lead ${newTeamObject.name} with monthly quota of AED ${newTeamObject.target.toLocaleString()}.`,
      timestamp: 'Just now',
      client: 'Internal Division'
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const handleAddActivity = (newAct) => {
    setActivities(prev => [newAct, ...prev]);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('alzaydan_current_user');
    } catch {
      // ignore
    }
    toast.success('Signed out from Sales Manager Console');
    navigate('/login');
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans flex">
      <Toaster position="top-right" richColors />

      {/* Left Sidebar (Matching CEO Layout: Dark Navy #011635, Blue Active Item) */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        salesSubTab={salesSubTab}
        setSalesSubTab={setSalesSubTab}
        customerSubTab={customerSubTab}
        setCustomerSubTab={setCustomerSubTab}
        pendingCount={pendingApprovalsCount}
      />

      {/* Main Content Area (Offset by Sidebar lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onSignOut={handleSignOut}
        />

        {/* Main Canvas Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5">
          {/* Active Navigation: Dashboard Overview (100% Identical to CEO / Super Admin Dashboard) */}
          {activeNav === 'Dashboard' && (
            <>
              {/* Row 1: 4 KPI Summary Cards (Identical to CEO Dashboard) */}
              <SummaryCards
                onSelectMetric={(tab) => setActiveNav(tab)}
                employeesCount={employees.length || 2}
                leadsCount={leads.length}
                customersCount={customers.length}
                salesAmount={0}
              />

              {/* Row 2: Commercial Sales Pipeline by Stage (Identical to CEO Dashboard) */}
              <CommercialPipelineBar onViewFullPipeline={() => setActiveNav('Sales')} />

              {/* Row 3: Recent Leads (7 cols) + Pending Tasks (5 cols) (Identical to CEO Dashboard) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7">
                  <RecentLeads
                    leads={leads}
                    onViewAll={() => setActiveNav('Leads')}
                  />
                </div>
                <div className="lg:col-span-5">
                  <PendingTasks
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onViewAll={() => setActiveNav('Tasks')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Active Navigation: Employees / Users Directory View */}
          {(activeNav === 'Employees' || activeNav === 'Users') && (
            <UsersDirectoryView />
          )}

          {/* Active Navigation: Leads View */}
          {activeNav === 'Leads' && (
            <LeadManager
              leads={leads}
              setLeads={setLeads}
              employees={employees}
              initialViewMode="list"
            />
          )}

          {/* Active Navigation: Customers View */}
          {activeNav === 'Customers' && (
            <CustomerManager
              activeTab={customerSubTab}
              setActiveTab={setCustomerSubTab}
              employees={employees}
            />
          )}

          {/* Active Navigation: Tasks View */}
          {activeNav === 'Tasks' && (
            <TaskManager
              employees={employees}
              customers={customers}
              leads={leads}
            />
          )}

          {/* Active Navigation: Sales View */}
          {activeNav === 'Sales' && (
            <SalesView
              transactions={salesTransactions}
              opportunities={opportunities}
              employees={employees}
              customers={customers}
              onOpenCreateModal={(type) => {
                setSalesCreateType(type || 'Opportunity');
                setIsCreateSalesModalOpen(true);
              }}
              activeSubTab={salesSubTab}
              setActiveSubTab={setSalesSubTab}
            />
          )}

          {/* Active Navigation: Approvals & Governance View */}
          {activeNav === 'Approvals' && (
            <div className="space-y-6">
              {/* 1. Manager Deal Approvals Queue */}
              <section id="approvals-section">
                <DealApprovals
                  approvals={approvals}
                  onApprove={handleApproveDeal}
                  onReject={handleRejectDeal}
                />
              </section>

              {/* 2. Assigned Team Leads & Add Team Lead Modal Trigger */}
              <section id="team-leads-section">
                <TeamLeadsManagerView
                  teams={teams}
                  onOpenAddModal={() => setIsAddTeamLeadOpen(true)}
                  onFilterTeamLeadActivities={(leadName) => {
                    setSelectedLeadFilter(leadName);
                    const el = document.getElementById('activities-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  selectedLeadFilter={selectedLeadFilter}
                />
              </section>

              {/* 3. Team Lead Live Activities Feed */}
              <section id="activities-section">
                <TeamLeadActivities
                  activities={activities}
                  teams={teams}
                  selectedLead={selectedLeadFilter}
                  onSelectLead={(lead) => setSelectedLeadFilter(lead)}
                  onAddActivity={handleAddActivity}
                />
              </section>
            </div>
          )}

        </main>
      </div>

      {/* Add Team Lead Modal */}
      <AddTeamLeadModal
        isOpen={isAddTeamLeadOpen}
        onClose={() => setIsAddTeamLeadOpen(false)}
        onAddTeamLead={handleAddTeamLead}
        currentManagerName={currentUser?.name || 'Muhammed shemin'}
      />

      {/* Create Sales Modal (For Opportunity, Quotation, Order, Invoice, Delivery Note) */}
      <CreateSalesModal
        isOpen={isCreateSalesModalOpen}
        onClose={() => setIsCreateSalesModalOpen(false)}
        type={salesCreateType}
        onCreated={(newItem) => {
          if (salesCreateType === 'Opportunity') {
            setOpportunities((prev) => [newItem, ...prev]);
          } else {
            setSalesTransactions((prev) => [newItem, ...prev]);
          }
          toast.success(`${salesCreateType} record created successfully!`);
          setIsCreateSalesModalOpen(false);
        }}
      />
    </div>
  );
}
