import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  PhoneCall,
  CheckSquare,
  Award,
  Settings,
  X,
  Target
} from 'lucide-react';
import { AlZaydanCrest } from '../../../components/AlZaydanLogo';
import { repProfile } from '../data/mockData';

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#051C33] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#0D3156] shadow-2xl lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-[#0D3156]/80 bg-[#041628]/60">
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

          {/* Rep Status & Quota Mini-Tracker */}
          <div className="px-4 py-3 border-b border-[#0D3156]/60 bg-[#06223F]/40">
            <div className="bg-[#031526]/70 rounded-xl p-3 border border-[#0D3156]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1 font-semibold text-[11px]">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Monthly Quota
                </span>
                <span className="font-bold text-blue-400">{repProfile.quotaProgress}%</span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mb-1">
                <div
                  className="bg-linear-to-r from-blue-500 to-[#1D4ED8] h-full rounded-full transition-all duration-500"
                  style={{ width: `${repProfile.quotaProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>AED 420k achieved</span>
                <span>500k goal</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
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

        {/* Bottom Role Card (Sales Executive Navy Card with Target & Wave Pattern) */}
        <div className="p-4 m-3 rounded-2xl bg-linear-to-b from-[#092B4D] to-[#051C33] border border-[#133E68] relative overflow-hidden shadow-lg">
          <div className="absolute -bottom-2 -right-4 w-32 h-16 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 25 C30 10, 70 40, 100 20 L100 40 L0 40 Z" fill="#3B82F6" />
            </svg>
          </div>

          <div className="relative z-10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {repProfile.name}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                Tier 4 SE • {repProfile.department}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
