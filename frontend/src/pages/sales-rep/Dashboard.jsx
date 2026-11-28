import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
  Award,
  Kanban,
  CheckSquare,
  PhoneCall,
  DollarSign,
  FileText
} from 'lucide-react';

import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import SummaryCards from './overview/SummaryCards';
import PipelineBoard from './deals/PipelineBoard';
import DealDetailModal from './deals/DealDetailModal';
import CallQueue from './calls/CallQueue';
import DailyTasks from './tasks/DailyTasks';

import {
  repProfile,
  initialDeals,
  todayCalls,
  dailyTasks,
  commissionHistory
} from './data/mockData';

export default function SalesRepDashboard() {
  const navigate = useNavigate();

  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Domain State
  const [deals, setDeals] = useState(initialDeals);
  const [calls, setCalls] = useState(todayCalls);
  const [tasks, setTasks] = useState(dailyTasks);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Deal handlers
  const handleUpdateDealStage = (dealId, nextStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage, daysInStage: 0 } : d))
    );
  };

  const handleAddDeal = (newDeal) => {
    setDeals((prev) => [newDeal, ...prev]);
  };

  const handleSaveDealDetails = (updatedDeal) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))
    );
  };

  // Call handlers
  const handleCompleteCall = (callId, outcomeNotes) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, status: 'completed', outcome: outcomeNotes }
          : c
      )
    );
  };

  // Task handlers
  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('alzaydan_current_user');
    } catch {
      // ignore
    }
    toast.success('Signed out from Sales Executive Workspace');
    navigate('/login');
  };

  // Filtered deals based on search term
  const filteredDeals = deals.filter(
    (d) =>
      d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  );

  const pendingCallsCount = calls.filter((c) => c.status === 'pending').length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">
      <Toaster position="top-right" richColors />

      {/* Deep Navy Corporate Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pendingCallsCount={pendingCallsCount}
        pendingTasksCount={pendingTasksCount}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <Header
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSignOut={handleSignOut}
        />

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Sub-Header / Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tier 4 Frontline Portal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {repProfile.department}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome back, {repProfile.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Reporting to <span className="font-semibold text-slate-700">{repProfile.teamLead}</span> (Team Lead) • <span className="font-semibold text-slate-700">{repProfile.salesManager}</span> (Sales Manager)
              </p>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { name: 'Dashboard', icon: Kanban },
                { name: 'My Deals', icon: Kanban },
                { name: 'Calls & Schedule', icon: PhoneCall },
                { name: 'Daily Tasks', icon: CheckSquare },
                { name: 'Commissions', icon: Award }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeNav === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveNav(tab.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-white text-[#063056] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <SummaryCards dealsCount={filteredDeals.filter(d => d.stage !== 'won').length} />

          {/* Conditional View Rendering */}
          {(activeNav === 'Dashboard' || activeNav === 'My Deals') && (
            <PipelineBoard
              deals={filteredDeals}
              onUpdateDealStage={handleUpdateDealStage}
              onSelectDeal={(deal) => setSelectedDeal(deal)}
              onAddDeal={handleAddDeal}
            />
          )}

          {activeNav === 'Dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CallQueue calls={calls} onCompleteCall={handleCompleteCall} />
              <DailyTasks
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}

          {activeNav === 'Calls & Schedule' && (
            <CallQueue calls={calls} onCompleteCall={handleCompleteCall} />
          )}

          {activeNav === 'Daily Tasks' && (
            <DailyTasks
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeNav === 'Commissions' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Personal Commission Ledger & Bonus Payouts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Official Tier 4 compensation record approved by Finance & HR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>Projected This Month: AED {repProfile.projectedCommission.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Commission Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Deals Won</th>
                      <th className="py-3 px-4">Closed Volume</th>
                      <th className="py-3 px-4">Tier Rate</th>
                      <th className="py-3 px-4">Earned Commission</th>
                      <th className="py-3 px-4">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissionHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          {item.month}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.dealsClosed} deals</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          AED {item.volume.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-blue-700 font-bold">{item.rate}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          AED {item.commission.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              item.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav === 'Settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Sales Executive Profile & Settings</h2>
              <p className="text-xs text-slate-500">Manage softphone integration, calendar sync, and notification thresholds.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Company Contact Record</div>
                  <div className="text-slate-600">{repProfile.email}</div>
                  <div className="text-slate-600">{repProfile.phone}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Reporting Chain</div>
                  <div className="text-slate-600">Lead: {repProfile.teamLead} (Team 1 Alpha)</div>
                  <div className="text-slate-600">Manager: {repProfile.salesManager}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drill-down Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onSaveDeal={handleSaveDealDetails}
        />
      )}
    </div>
  );
}
