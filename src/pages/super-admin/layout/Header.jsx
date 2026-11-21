import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Calendar,
  Shield,
  LogOut,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { CANONICAL_SYSTEM_USERS } from '../../../utils/userDirectory';

function getActiveUserProfile() {
  const canonicalSuperAdmin = CANONICAL_SYSTEM_USERS[0];
  try {
    const stored = localStorage.getItem('alzaydan_current_user');
    const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
    
    if (!stored) {
      return canonicalSuperAdmin;
    }
    const user = JSON.parse(stored);
    
    // Look up strictly by user's email, id or name
    const targetEmail = (user?.email || '').toLowerCase().trim();
    const matched = emps.find(
      (e) =>
        (targetEmail && e.email && e.email.toLowerCase().trim() === targetEmail) ||
        (user?.id && e.id === user.id) ||
        (user?.name && e.name && e.name.toLowerCase().trim() === user.name.toLowerCase().trim())
    ) || CANONICAL_SYSTEM_USERS.find(
      (c) =>
        (targetEmail && c.email && c.email.toLowerCase().trim() === targetEmail) ||
        (user?.id && c.id === user.id)
    );

    const effectiveImage = user.image || user.avatar || matched?.image || matched?.avatar || canonicalSuperAdmin.image;

    return {
      ...canonicalSuperAdmin,
      ...matched,
      ...user,
      name: user.name || matched?.name || canonicalSuperAdmin.name,
      email: user.email || matched?.email || canonicalSuperAdmin.email,
      role: user.role || matched?.role || user.designation || canonicalSuperAdmin.role,
      roleTier: user.roleTier || matched?.roleTier || canonicalSuperAdmin.roleTier,
      designation: user.designation || matched?.designation || user.role || canonicalSuperAdmin.designation,
      department: user.department || matched?.department || canonicalSuperAdmin.department,
      image: effectiveImage,
      avatar: effectiveImage,
      isImage: Boolean(effectiveImage)
    };
  } catch {
    return canonicalSuperAdmin;
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
  const fileInputRef = useRef(null);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const updated = {
          ...currentUser,
          image: dataUrl,
          avatar: dataUrl,
          isImage: true
        };
        setCurrentUser(updated);
        try {
          localStorage.setItem('alzaydan_current_user', JSON.stringify(updated));
          const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
          const updatedEmps = emps.map(emp => {
            if (
              (emp.email && emp.email.toLowerCase() === (updated.email || '').toLowerCase()) ||
              emp.id === updated.id
            ) {
              return { ...emp, image: dataUrl, avatar: dataUrl, isImage: true };
            }
            return emp;
          });
          localStorage.setItem('alzaydan_custom_employees', JSON.stringify(updatedEmps));
        } catch (err) {
          console.error('Failed to save profile photo', err);
        }
        window.dispatchEvent(new Event('alzaydan_user_updated'));
        toast.success('Profile photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

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

        <div className="relative w-full max-w-md min-w-0">
          <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, customers, employees, tasks..."
            className="w-full pl-10 pr-4 sm:pr-20 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition placeholder:text-slate-400 text-slate-800"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-400 shadow-2xs">
              Ctrl + K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Date Filter, Notifications, Help, User Avatar + Name */}
      <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
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
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-xs">
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
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-3">
                <div className="relative group shrink-0">
                  {currentUser?.image || currentUser?.avatar ? (
                    <img
                      src={currentUser.image || currentUser.avatar}
                      alt={currentUser.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#011635] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Photo"
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
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

              {/* Hidden File Input for Instant Profile Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />

              <div className="py-1 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Profile Photo</span>
                </button>
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
