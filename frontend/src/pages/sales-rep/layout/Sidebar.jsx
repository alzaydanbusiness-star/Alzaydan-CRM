import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban,
  PhoneCall,
  CheckSquare,
  Award,
  Settings,
  X
} from 'lucide-react';
import { AlZaydanCrest } from '../../../components/AlZaydanLogo';

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
  pendingCallsCount = 3,
  pendingTasksCount = 3
}) {
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Deals', icon: Kanban, badge: '6' },
    { name: 'Calls & Schedule', icon: PhoneCall, badge: pendingCallsCount > 0 ? `${pendingCallsCount}` : null },
    { name: 'Daily Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null },
    { name: 'Commissions', icon: Award },
    { name: 'Settings', icon: Settings }
  ];

  // Prevent background scrolling on mobile when sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container (Dark Navy Blue) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#051C33] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#0D3156] shadow-2xl lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-[#0D3156]/80 bg-[#041628]/60 shrink-0">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveNav('Dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xs">
                <AlZaydanCrest className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-extrabold tracking-tight text-white text-base leading-tight">
                  Al Zaydan CRM
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                  Sales Executive
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveNav(item.name);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-[#08294B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1D4ED8] text-white shadow-2xs"
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
