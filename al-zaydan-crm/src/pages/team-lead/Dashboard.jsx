import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

import {
  activeTeam,
  initialTeamReps,
  initialRoutingQueue,
  teamLeadNotifications
} from './data/mockData';

// Layout Components
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

// Standard Enterprise CRM Modules (Unified with Manager & Super Admin)
import SummaryCards from '../super-admin/overview/SummaryCards';
import CommercialPipelineBar from '../super-admin/overview/CommercialPipelineBar';
import RecentLeads from '../super-admin/overview/RecentLeads';
import PendingTasks from '../super-admin/overview/PendingTasks';
import TaskManager from '../super-admin/tasks/TaskManager';
import LeadManager from '../super-admin/leads/LeadManager';
import CustomerManager from '../super-admin/customers/CustomerManager';
import SalesView from '../super-admin/sales/SalesView';
import UsersDirectoryView from '../super-admin/users/UsersDirectoryView';
import ReportManager from '../super-admin/reports/ReportManager';
import { getStoredUsers } from '../../utils/userDirectory';

// Team Lead Operational Modules
import RepRoster from './reps/RepRoster';
import RepDetailModal from './reps/RepDetailModal';
import LeadRoutingQueue from './leads/LeadRoutingQueue';

export default function TeamLeadDashboard({
  initialNav = 'Dashboard',
  initialCustomerSubTab = 'Customer',
  initialSalesSubTab = 'Opportunity'
}) {
  const navigate = useNavigate();

  // Navigation state
  const [activeNav, setActiveNav] = useState(initialNav);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesSubTab, setSalesSubTab] = useState(initialSalesSubTab);
  const [customerSubTab, setCustomerSubTab] = useState(initialCustomerSubTab);

  // Live Team Lead State & Synced Employees
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

  const [team] = useState(activeTeam);
  
  // Format reps from active current staff / sales executives in employees
  const reps = useMemo(() => {
    const staffEmps = employees.filter(
      (u) =>
        u.roleTier === 'staff' ||
        (u.crmProfile || '').toLowerCase().includes('sales') ||
        (u.role || '').toLowerCase().includes('executive')
    );

    if (staffEmps.length > 0) {
      return staffEmps.map((emp, idx) => ({
        id: `rep-${emp.id || idx + 1}`,
        name: emp.name,
        role: emp.designation || emp.role || 'Sales Executive',
        email: emp.email,
        phone: emp.phone || emp.mobileNumber ? `${emp.mobilePrefix || '+971'} ${emp.mobileNumber || ''}`.trim() : '+971 55 556 7890',
        target: 200000,
        sales: 215000,
        dealsWon: 8,
        activeLeads: 14,
        demosToday: 3,
        demosTarget: 3,
        proposalsToday: 2,
        slaRate: '99.1%',
        winRate: 42.1,
        status: 'Active',
        avatar: emp.avatarText || emp.name.slice(0, 2).toUpperCase(),
        image: emp.image || emp.avatar || null,
        recentActivity: `Active in pipeline under Team Lead`,
        deals: []
      }));
    }
    return initialTeamReps;
  }, [employees]);

  const [routingQueue, setRoutingQueue] = useState(initialRoutingQueue);
  const [notifications] = useState(teamLeadNotifications);

  // Modal State
  const [selectedRep, setSelectedRep] = useState(null);

  // Shared CRM Datasets
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers] = useState([]);
  const [opportunities] = useState([]);
  const [salesTransactions] = useState([]);

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Handle assigning an incoming lead to an SE rep
  const handleAssignLead = (leadId, repId, repName) => {
    const lead = routingQueue.find((l) => l.id === leadId);
    setRoutingQueue((prev) => prev.filter((l) => l.id !== leadId));

    if (lead) {
      setReps((prev) =>
        prev.map((r) => {
          if (r.id === repId) {
            return {
              ...r,
              activeLeads: r.activeLeads + 1,
              deals: [
                ...r.deals,
                {
                  id: `d-${Date.now()}`,
                  client: lead.company,
                  stage: 'New Inquiry',
                  value: lead.value,
                  probability: 30
                }
              ]
            };
          }
          return r;
        })
      );
      toast.success(`Assigned "${lead.company}" to ${repName || 'Sales Executive'}`);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('alzaydan_current_user');
    } catch {
      // ignore
    }
    toast.success('Signed out from Team Lead Workspace');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans flex">
      <Toaster position="top-right" richColors theme="light" />

      {/* Sidebar (Matching Manager & Super Admin) */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        salesSubTab={salesSubTab}
        setSalesSubTab={setSalesSubTab}
        customerSubTab={customerSubTab}
        setCustomerSubTab={setCustomerSubTab}
        pendingLeadsCount={routingQueue.length}
        repsCount={reps.length}
        teamName={team.name}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen flex-1 min-w-0">
        
        {/* Header */}
        <Header
          setSidebarOpen={setSidebarOpen}
          team={team}
          notifications={notifications}
          onSignOut={handleSignOut}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Canvas Area (100% Unified with Manager & Super Admin) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5">
          
          {/* Active Navigation: Dashboard Overview */}
          {activeNav === 'Dashboard' && (
            <>
              {/* Row 1: 4 KPI Summary Cards (Identical to Manager & Super Admin) */}
              <SummaryCards
                onSelectMetric={(tab) => setActiveNav(tab)}
                employeesCount={reps.length || 3}
                leadsCount={leads.length}
                customersCount={customers.length}
                salesAmount={team.closedSales || 485000}
              />

              {/* Row 2: Commercial Sales Pipeline by Stage (Identical to Manager & Super Admin) */}
              <CommercialPipelineBar onViewFullPipeline={() => setActiveNav('Sales')} />

              {/* Row 3: Assigned Sales Executives (Team Alpha) Roster */}
              <section id="reps-section">
                <RepRoster
                  reps={reps}
                  onSelectRep={(rep) => setSelectedRep(rep)}
                />
              </section>

              {/* Row 4: Lead Routing Queue Section */}
              <section id="routing-section">
                <LeadRoutingQueue
                  queue={routingQueue}
                  reps={reps}
                  onAssignLead={handleAssignLead}
                />
              </section>

              {/* Row 5: Recent Leads (7 cols) + Pending Tasks (5 cols) (Identical to Manager & Super Admin) */}
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

          {/* Active Navigation: Tasks View */}
          {activeNav === 'Tasks' && (
            <TaskManager
              employees={employees}
              customers={customers}
              leads={leads}
            />
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

          {/* Active Navigation: Sales View */}
          {activeNav === 'Sales' && (
            <SalesView
              transactions={salesTransactions}
              opportunities={opportunities}
              employees={employees}
              customers={customers}
              activeSubTab={salesSubTab}
              setActiveSubTab={setSalesSubTab}
            />
          )}

          {/* Active Navigation: Sales Reps View */}
          {activeNav === 'Reps' && (
            <div className="space-y-6">
              <RepRoster
                reps={reps}
                onSelectRep={(rep) => setSelectedRep(rep)}
              />
            </div>
          )}

          {/* Active Navigation: Routing Queue View */}
          {activeNav === 'Routing' && (
            <div className="space-y-6">
              <LeadRoutingQueue
                queue={routingQueue}
                reps={reps}
                onAssignLead={handleAssignLead}
              />
            </div>
          )}

          {/* Active Navigation: Unit Users Directory */}
          {activeNav === 'Users' && (
            <UsersDirectoryView />
          )}

          {/* Active Navigation: Reports View */}
          {activeNav === 'Reports' && (
            <ReportManager onBack={() => setActiveNav('Dashboard')} />
          )}
        </main>
      </div>

      {/* Rep Detail Modal */}
      {selectedRep && (
        <RepDetailModal
          rep={selectedRep}
          onClose={() => setSelectedRep(null)}
        />
      )}
    </div>
  );
}
