import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Calendar,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

function getActiveTeamLeadProfile() {
  try {
    const saved = localStorage.getItem('alzaydan_current_user');
    const user = saved ? JSON.parse(saved) : null;
    const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
    const targetEmail = (user?.email || '').toLowerCase();
    const matched = emps.find(
      (e) =>
        (e.email && e.email.toLowerCase() === targetEmail) ||
        (user?.roleTier && e.roleTier === user.roleTier) ||
        (e.roleTier === 'team-lead')
    );

    if (matched) {
      return {
        ...user,
        name: matched.name || user?.name || 'Muhammed riswan',
        email: matched.email || user?.email || 'riswan@alzaydan.com',
        image: matched.image || matched.avatar || user?.image || user?.avatar || null,
        avatar: matched.avatar || matched.image || user?.avatar || user?.image || null,
        isImage: Boolean(matched.image || matched.avatar || user?.image || user?.avatar),
        role: matched.role || user?.role || 'Team Lead',
        designation: matched.designation || user?.designation || 'Sales Team Lead',
        department: matched.department || user?.department || 'Commercial Sales'
      };
    }

    return user || {
      name: 'Muhammed riswan',
      email: 'riswan@alzaydan.com',
      role: 'Team Lead',
      roleTier: 'team-lead',
      department: 'Commercial Sales'
    };
  } catch {
    return {
      name: 'Muhammed riswan',
      email: 'riswan@alzaydan.com',
      role: 'Team Lead',
      roleTier: 'team-lead',
      department: 'Commercial Sales'
    };
  }
}

export default function Header({
  setSidebarOpen,
  team = { name: 'Team 1 (Alpha)', lead: 'Muhammed riswan', leadEmail: 'riswan@alzaydan.com' },
  notifications = [],
  onSignOut,
  searchQuery = '',
  setSearchQuery
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Nov 1, 2026 – Nov 9, 2026');
  const [currentUser, setCurrentUser] = useState(getActiveTeamLeadProfile);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateRangeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(getActiveTeamLeadProfile());
    };

    window.addEventListener('alzaydan_user_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const leadName = currentUser?.name || team.lead || 'Muhammed riswan';
  const leadEmail = currentUser?.email || team.leadEmail || 'riswan@alzaydan.com';
  const leadInitials = currentUser?.avatarText || (leadName ? leadName.slice(0, 2).toUpperCase() : 'TL');
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search (Matching Super Admin & Manager) */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search leads, customers, employees, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="w-full text-xs py-1.5 pl-9 pr-14 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-[#011635] focus:ring-2 focus:ring-[#011635]/15 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-400">
              ctrl + k
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Date Filter */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => setDateRangeOpen(!dateRangeOpen)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dateRangeOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
              {['Today', 'This Week', 'Nov 1, 2026 – Nov 9, 2026', 'This Month (Nov 2026)', 'Q4 2026'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setDateRange(r);
                    setDateRangeOpen(false);
                    toast.success(`Filter updated: ${r}`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Team Alerts ({unreadCount})</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer" onClick={() => toast.success('Alerts marked as read')}>
                  Mark all read
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 text-xs">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 hover:bg-slate-50 flex items-start gap-2.5 ${n.unread ? 'bg-blue-50/30' : ''}`}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-[11px]">{n.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{n.desc}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button
          type="button"
          onClick={() => toast.info('Team Lead Help & Documentation')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          title="Help & Guides"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Team Lead Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition"
          >
            {currentUser?.image ? (
              <img
                src={currentUser.image}
                alt={leadName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-xs shadow-2xs ring-2 ring-blue-500/20">
                {leadInitials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{leadName}</div>
              <div className="text-[10px] text-blue-600 font-semibold leading-tight">Team Lead</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="text-xs font-bold text-slate-900">{leadName}</div>
                <div className="text-[11px] text-slate-500">{leadEmail}</div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                  <span>Unit Lead &bull; {team.name}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    try {
                      localStorage.removeItem('alzaydan_current_user');
                    } catch {
                      // ignore
                    }
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
