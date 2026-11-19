import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Calendar,
  Shield,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

function getActiveUserProfile() {
  try {
    const stored = localStorage.getItem('alzaydan_current_user');
    if (!stored) {
      return {
        name: 'Super Admin',
        email: 'al@gmail.com',
        role: 'Super Admin',
        roleTier: 'super-admin',
        designation: 'Chief Executive Officer (CEO)',
        department: 'Executive Management'
      };
    }
    const user = JSON.parse(stored);
    const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
    
    // Look up strictly by user's email, id or name
    const targetEmail = (user?.email || '').toLowerCase().trim();
    const matched = emps.find(
      (e) =>
        (targetEmail && e.email && e.email.toLowerCase().trim() === targetEmail) ||
        (user?.id && e.id === user.id) ||
        (user?.name && e.name && e.name.toLowerCase().trim() === user.name.toLowerCase().trim())
    );

    if (matched) {
      return {
        ...matched,
        ...user,
        name: user.name || matched.name,
        email: user.email || matched.email,
        role: user.role || matched.role || matched.designation || 'Sales Executive',
        roleTier: user.roleTier || matched.roleTier || 'staff',
        designation: user.designation || matched.designation || user.role || 'Sales Executive',
        department: user.department || matched.department || 'Commercial Operations',
        image: user.image || matched.image || user.avatar || matched.avatar || null,
        avatar: user.avatar || matched.avatar || user.image || matched.image || null,
        isImage: Boolean(user.image || matched.image || user.avatar || matched.avatar)
      };
    }

    return user;
  } catch {
    return { name: 'Super Admin', email: 'al@gmail.com', role: 'Super Admin' };
  }
}

export default function Header({
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  onSignOut
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getActiveUserProfile);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to profile updates from Users Directory
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

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SA';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Hamburger + Global Search with Ctrl+K */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, customers, employees, tasks..."
            className="w-full pl-10 pr-20 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition placeholder:text-slate-400 text-slate-800"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-400 shadow-2xs">
              Ctrl + K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Date Filter, Notifications, Help, User Avatar + Name */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Date Filter Pill */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => toast.info('Date Filter: Nov 1, 2026 – Nov 9, 2026 active.')}
            className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Nov 1, 2026 – Nov 9, 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Notifications with Blue Dot */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="font-bold text-slate-800 text-[11px]">Gulf Logistics Deal Approved</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Assigned to Muhammed K.</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-800 text-[11px]">New Lead: Fatima Al Hassan</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Al Noor Trading inquired today.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Circle Icon */}
        <button
          type="button"
          onClick={() => toast.info('Al Zaydan Enterprise Command: Help & Documentation is active.')}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Profile: Avatar + Name + Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            {currentUser?.image || currentUser?.avatar ? (
              <img
                src={currentUser.image || currentUser.avatar}
                alt={currentUser.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#011635]/20 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || 'Super Admin'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                {currentUser?.role || currentUser?.designation || 'Sales Executive'}
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
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {initials}
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
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span>{currentUser?.role || currentUser?.designation || 'Staff'}</span>
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
    </header>
  );
}
