import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Filter,
  Users,
  DollarSign,
  Package,
  BarChart2,
  Settings as SettingsIcon,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Shield,
  LogOut,
  Building2,
  KeyRound,
  FileText,
  ThumbsUp,
  ReceiptText,
  BadgeDollarSign
} from 'lucide-react';
import { AlZaydanCrest } from '../../../components/AlZaydanLogo';

function getActiveUserProfile() {
  try {
    const stored = localStorage.getItem('alzaydan_current_user');
    const user = stored ? JSON.parse(stored) : null;
    const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
    const targetEmail = (user?.email || 'al@gmail.com').toLowerCase();
    const matched = emps.find(
      (e) =>
        (e.email && e.email.toLowerCase() === targetEmail) ||
        (e.email && e.email.toLowerCase() === 'al@gmail.com') ||
        e.roleTier === 'super-admin'
    );

    if (matched) {
      return {
        ...user,
        name: matched.name || user?.name || 'Super Admin',
        email: matched.email || user?.email || 'al@gmail.com',
        image: matched.image || matched.avatar || user?.image || user?.avatar || null,
        avatar: matched.avatar || matched.image || user?.avatar || user?.image || null,
        isImage: Boolean(matched.image || matched.avatar || user?.image || user?.avatar),
        role: matched.role || user?.role || 'Super Admin',
        designation: matched.designation || user?.designation || 'Chief Executive Officer (CEO)',
        department: matched.department || user?.department || 'Executive Management'
      };
    }
    return user || { name: 'Super Admin', email: 'al@gmail.com', role: 'Super Admin' };
  } catch {
    return { name: 'Super Admin', email: 'al@gmail.com', role: 'Super Admin' };
  }
}

export default function TopNavBar({
  activeNav,
  setActiveNav,
  _salesSubTab,
  setSalesSubTab,
  searchQuery,
  setSearchQuery,
  onOpenQuickModal,
  onSignOut
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeDropdownTab, setActiveDropdownTab] = useState(null); // 'Lead' | 'Customer' | 'Sales' | 'Purchase' | 'Settings'
  const [currentUser, setCurrentUser] = useState(getActiveUserProfile);

  const profileRef = useRef(null);
  const quickAddRef = useRef(null);
  const notifRef = useRef(null);
  const navDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setQuickAddOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        setActiveDropdownTab(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(getActiveUserProfile());
    };

    window.addEventListener('alzaydan_user_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const handleNavClick = (tabName) => {
    setActiveNav(tabName);
    setActiveDropdownTab(null);
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      {/* ================= TIER 1: BRAND + GLOBAL ACTIONS BAR ================= */}
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 border-b border-slate-100">
        
        {/* Brand Logo & Name (With official vector logo badge & typography) */}
        <div
          onClick={() => handleNavClick('Dashboard')}
          className="flex items-center gap-3.5 cursor-pointer shrink-0 py-1 select-none group"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#16477A] via-[#103E6D] to-[#0A2744] p-2 flex items-center justify-center shadow-md shadow-[#16477A]/25 border border-white/20 group-hover:scale-105 transition-all">
            <AlZaydanCrest className="w-full h-full text-white" color="#FFFFFF" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 leading-none">
              <span className="font-black tracking-tight text-[#16477A] text-sm sm:text-base lg:text-lg">
                AL ZAYDAN INTERNATIONAL
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-xs">
                CRM
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
              INTERNATIONAL FZE • GLOBAL COMMERCIAL OPERATIONS
            </div>
          </div>
        </div>

        {/* Global Search + Quick Add + Notifications + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Input with integrated Search Button */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, contact & lead..."
              className="w-64 lg:w-72 pl-3.5 pr-10 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#16477A] focus:ring-2 focus:ring-[#16477A]/15 outline-none transition placeholder:text-slate-400"
            />
            <button
              type="button"
              className="absolute right-1 w-7 h-7 rounded-lg bg-[#16477A] hover:bg-[#1E5EA8] text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action (+) Button */}
          <div className="relative" ref={quickAddRef}>
            <button
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition font-bold cursor-pointer"
              title="Quick Create"
            >
              <Plus className="w-4 h-4" />
            </button>

            {quickAddOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Create
                </div>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickModal('create-lead');
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ New Commercial Lead</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickModal('add-employee');
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Add New Employee</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickModal('add-customer');
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>+ Add Corporate Customer</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickModal('create-task');
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 flex items-center gap-2"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Assign New Task</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell with 9+ Red Badge */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-600 text-white border-2 border-white shadow-xs">
                9+
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-800 text-xs">System Notifications</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    9+ Action Required
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <div className="font-bold text-[#0E355C] text-[11px]">Q4 Enterprise Deal Approved</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Gulf Horizon Petrochemicals order approved.</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-800 text-[11px]">New Lead Routed to Team 1</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Apex Logistics assigned to Omar Farooq.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile: Avatar + Name + Title + Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              {currentUser?.image || currentUser?.avatar ? (
                <img
                  src={currentUser.image || currentUser.avatar}
                  alt={currentUser.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#16477A]/20 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16477A] to-[#0E355C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.name
                    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'SA'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Super Admin'}
                </div>
                <div className="text-[10px] font-semibold text-slate-400">
                  {currentUser?.designation || 'CEO'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-3">
                  {currentUser?.image || currentUser?.avatar ? (
                    <img
                      src={currentUser.image || currentUser.avatar}
                      alt={currentUser.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#16477A]/20 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16477A] to-[#0E355C] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {currentUser?.name
                        ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'SA'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {currentUser?.name || 'Super Admin (CEO)'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email || 'al@gmail.com'}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                      <Shield className="w-3 h-3 text-[#16477A]" />
                      <span>Tier 1: Global Executive Command</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TIER 2: HORIZONTAL MENU NAVIGATION TABS (Generous Width & Size) ================= */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 overflow-x-auto flex items-center gap-2 sm:gap-2.5 scrollbar-none" ref={navDropdownRef}>
        
        {/* 1. Dashboard Tab */}
        <button
          onClick={() => handleNavClick('Dashboard')}
          className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeNav === 'Dashboard'
              ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
              : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* 2. Task Tab */}
        <button
          onClick={() => handleNavClick('Tasks')}
          className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeNav === 'Tasks'
              ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
              : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task</span>
        </button>

        {/* 3. Lead Dropdown Tab (Matching Image: All Leads ▾) */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              if (activeDropdownTab === 'Lead') setActiveDropdownTab(null);
              else setActiveDropdownTab('Lead');
            }}
            className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeNav === 'Leads'
                ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
                : activeDropdownTab === 'Lead'
                ? 'bg-slate-100 text-[#16477A] border border-slate-200/80'
                : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>All Leads</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {activeDropdownTab === 'Lead' && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
              <button
                onClick={() => handleNavClick('Leads')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-[#16477A]"
              >
                + Add Lead
              </button>
              <button
                onClick={() => handleNavClick('Leads')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700"
              >
                All Commercial Leads
              </button>
            </div>
          )}
        </div>

        {/* 4. Customer Dropdown Tab */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              if (activeDropdownTab === 'Customer') setActiveDropdownTab(null);
              else setActiveDropdownTab('Customer');
            }}
            className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeNav === 'Customers'
                ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
                : activeDropdownTab === 'Customer'
                ? 'bg-slate-100 text-[#16477A] border border-slate-200/80'
                : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customer</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {activeDropdownTab === 'Customer' && (
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
              <button
                onClick={() => handleNavClick('Customers')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700"
              >
                Enterprise Accounts (1,428)
              </button>
              <button
                onClick={() => {
                  handleNavClick('Customers');
                  onOpenQuickModal('add-customer');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-[#16477A]"
              >
                + Add Enterprise Client
              </button>
            </div>
          )}
        </div>

        {/* 5. Sales Dropdown Tab */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              if (activeDropdownTab === 'Sales') setActiveDropdownTab(null);
              else setActiveDropdownTab('Sales');
            }}
            className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeNav === 'Sales'
                ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
                : activeDropdownTab === 'Sales'
                ? 'bg-slate-100 text-[#16477A] border border-slate-200/80'
                : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Sales</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {activeDropdownTab === 'Sales' && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs space-y-0.5">
              {[
                { label: 'Opportunity', subTab: 'Opportunity', icon: KeyRound },
                { label: 'Quotation', subTab: 'Quotation', icon: FileText },
                { label: 'Sales Order', subTab: 'Sales Order', icon: ThumbsUp },
                { label: 'Tax Invoice', subTab: 'Tax Invoice', icon: ReceiptText },
                { label: 'Receipt', subTab: 'Receipt', icon: BadgeDollarSign }
              ].map((sub, idx) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSalesSubTab(sub.subTab);
                      handleNavClick('Sales');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <SubIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Employees Tab */}
        <button
          onClick={() => handleNavClick('Employees')}
          className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeNav === 'Employees'
              ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
              : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees</span>
        </button>

        {/* 7. Purchase Dropdown Tab */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              if (activeDropdownTab === 'Purchase') setActiveDropdownTab(null);
              else setActiveDropdownTab('Purchase');
            }}
            className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeNav === 'Purchase'
                ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
                : activeDropdownTab === 'Purchase'
                ? 'bg-slate-100 text-[#16477A] border border-slate-200/80'
                : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Purchase</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {activeDropdownTab === 'Purchase' && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
              <button
                onClick={() => {
                  handleNavClick('Dashboard');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700"
              >
                Purchase Orders
              </button>
              <button
                onClick={() => {
                  handleNavClick('Dashboard');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg font-semibold text-slate-700"
              >
                Vendor Quotations
              </button>
            </div>
          )}
        </div>

        {/* 8. Report Tab */}
        <button
          onClick={() => handleNavClick('Reports')}
          className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeNav === 'Reports'
              ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
              : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Report</span>
        </button>

        {/* 9. Settings Tab (Direct, Unified Settings) */}
        <button
          onClick={() => handleNavClick('Settings')}
          className={`px-5 sm:px-5.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeNav === 'Settings'
              ? 'bg-gradient-to-r from-[#16477A] to-[#0E355C] text-white shadow-md shadow-[#16477A]/25 border border-white/10'
              : 'text-slate-600 hover:text-[#16477A] hover:bg-slate-100/90 border border-transparent'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
