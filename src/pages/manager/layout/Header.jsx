import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Calendar,
  Briefcase,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

function getActiveManagerProfile() {
  try {
    const saved = localStorage.getItem('alzaydan_current_user');
    const user = saved ? JSON.parse(saved) : null;
    const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
    const targetEmail = (user?.email || 'shemin@gmail.com').toLowerCase();
    const matched = emps.find(
      (e) =>
        (e.email && e.email.toLowerCase() === targetEmail) ||
        (user?.roleTier && e.roleTier === user.roleTier) ||
        (e.roleTier === 'manager')
    );

    if (matched) {
      return {
        ...user,
        name: matched.name || user?.name || 'Muhammed shemin',
        email: matched.email || user?.email || 'shemin@gmail.com',
        image: matched.image || matched.avatar || user?.image || user?.avatar || null,
        avatar: matched.avatar || matched.image || user?.avatar || user?.image || null,
        isImage: Boolean(matched.image || matched.avatar || user?.image || user?.avatar),
        role: matched.role || user?.role || 'Sales Manager',
        designation: matched.designation || user?.designation || 'Head of Commercial',
        department: matched.department || user?.department || 'Sales & Commercial'
      };
    }

    return user || {
      name: 'Muhammed shemin',
      email: 'shemin@gmail.com',
      role: 'Sales Manager',
      roleTier: 'manager',
      department: 'Sales & Commercial'
    };
  } catch {
    return {
      name: 'Muhammed shemin',
      email: 'shemin@gmail.com',
      role: 'Sales Manager',
      roleTier: 'manager',
      department: 'Sales & Commercial'
    };
  }
}

export default function Header({
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  notifications = [],
  onSignOut
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getActiveManagerProfile);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(getActiveManagerProfile());
    };

    window.addEventListener('alzaydan_user_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('alzaydan_user_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SM';

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
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
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

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="space-y-2 text-slate-600 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-blue-50/40 border border-blue-100 hover:bg-blue-50/70 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle Icon */}
        <button
          type="button"
          onClick={() => toast.info('Sales Manager Help & Operational Guidelines active.')}
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
                {currentUser?.name || 'Sales Manager'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
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
                  <div className="font-bold text-slate-900 truncate">{currentUser?.name || 'Sales Manager'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'manager@alzaydan.com'}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                    <Briefcase className="w-3 h-3 text-blue-600" />
                    <span>Tier 2: Sales Manager Command</span>
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
