import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  ListFilter,
  Shield,
  Hourglass,
  Users,
  Inbox,
  ChevronDown,
  X,
  Contact,
  KeyRound,
  FileText,
  ThumbsUp,
  ReceiptText,
  BadgeDollarSign,
  Layers
} from 'lucide-react';
import { AlZaydanCrest } from '../../../components/AlZaydanLogo';

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
  salesSubTab = 'Opportunity',
  setSalesSubTab,
  customerSubTab = 'Customer',
  setCustomerSubTab,
  pendingLeadsCount = 0,
  repsCount = 3,
  teamName = 'Team 1 (Alpha)'
}) {
  const [userToggledNav, setUserToggledNav] = useState(null);
  const [prevActiveNav, setPrevActiveNav] = useState(activeNav);

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

  if (activeNav !== prevActiveNav) {
    setPrevActiveNav(activeNav);
    setUserToggledNav(null);
  }

  const expandedNav =
    userToggledNav !== null
      ? userToggledNav === 'none'
        ? null
        : userToggledNav
      : activeNav === 'Customers'
      ? 'Customer'
      : activeNav === 'Sales'
      ? 'Sales'
      : null;

  // Unified Team Lead Navigation (Matching Manager & Super Admin CRM Structure)
  const navigationItems = [
    { name: 'Dashboard', tab: 'Dashboard', icon: Home },
    { name: 'Task', tab: 'Tasks', icon: CheckSquare },
    { name: 'Lead', tab: 'Leads', icon: ListFilter },
    {
      name: 'Customer',
      tab: 'Customers',
      icon: Shield,
      hasDropdown: true,
      subItems: [
        { label: 'Customer', subTab: 'Customer', tab: 'Customers', icon: Shield },
        { label: 'Contact', subTab: 'Contact', tab: 'Customers', icon: Contact }
      ]
    },
    {
      name: 'Sales',
      tab: 'Sales',
      icon: Hourglass,
      hasDropdown: true,
      subItems: [
        { label: 'Opportunity', subTab: 'Opportunity', tab: 'Sales', icon: KeyRound },
        { label: 'Quotation', subTab: 'Quotation', tab: 'Sales', icon: FileText },
        { label: 'Sales Order', subTab: 'Sales Order', tab: 'Sales', icon: ThumbsUp },
        { label: 'Tax Invoice', subTab: 'Tax Invoice', tab: 'Sales', icon: ReceiptText },
        { label: 'Receipt', subTab: 'Receipt', tab: 'Sales', icon: BadgeDollarSign }
      ]
    },
    {
      name: 'Sales Reps',
      tab: 'Reps',
      icon: Users,
      badge: repsCount > 0 ? `${repsCount}` : null
    },
    {
      name: 'Lead Routing',
      tab: 'Routing',
      icon: Inbox,
      badge: pendingLeadsCount > 0 ? `${pendingLeadsCount}` : null
    },
    {
      name: 'User',
      tab: 'Users',
      icon: Users
    },
    {
      name: 'Report',
      tab: 'Reports',
      icon: FileText
    }
  ];

  const handleItemClick = (item) => {
    setActiveNav(item.tab);
    if (item.hasDropdown) {
      setUserToggledNav(expandedNav === item.name ? 'none' : item.name);
    } else {
      setUserToggledNav('none');
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container (Dark Navy #011635 Matching Reference Image) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#011635] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#03234d]/60 shadow-2xl lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#03234d]/80 bg-[#01122b]/50">
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => {
                setActiveNav('Dashboard');
                setUserToggledNav('none');
                setSidebarOpen(false);
              }}
            >
              <AlZaydanCrest className="w-7 h-7 shrink-0" twoTone={true} />
              <div className="leading-tight">
                <div className="font-extrabold text-white text-sm tracking-tight">
                  Al Zaydan
                </div>
                <div className="text-[10px] font-semibold text-slate-300 tracking-wider">
                  International FZE
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.tab || activeNav === item.name;
              const isExpanded = expandedNav === item.name;

              return (
                <div key={item.name} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0055D4] text-white font-bold shadow-md shadow-blue-900/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-[#0055D4]'
                            : 'bg-amber-400 text-slate-950 shadow-xs'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        } ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Submenu Dropdown */}
                  {item.hasDropdown && isExpanded && item.subItems && (
                    <div className="pl-9 pr-2 py-1 space-y-0.5">
                      {item.subItems.map((sub, sIdx) => {
                        const isSubActive =
                          item.tab === 'Sales' && sub.subTab
                            ? activeNav === 'Sales' && salesSubTab === sub.subTab
                            : item.tab === 'Customers' && sub.subTab
                            ? activeNav === 'Customers' && customerSubTab === sub.subTab
                            : activeNav === sub.tab;

                        const SubIcon = sub.icon;

                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNav(sub.tab);
                              if (sub.subTab && item.tab === 'Sales' && setSalesSubTab) {
                                setSalesSubTab(sub.subTab);
                              }
                              if (sub.subTab && item.tab === 'Customers' && setCustomerSubTab) {
                                setCustomerSubTab(sub.subTab);
                              }
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                              isSubActive
                                ? 'bg-white/15 text-white font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {SubIcon && (
                              <SubIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Role Card (Team Lead) */}
        <div className="p-3.5 m-3 rounded-2xl bg-linear-to-b from-[#092B4D] to-[#011635] border border-[#133E68] relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                Team Lead
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                Unit Command &bull; {teamName}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
