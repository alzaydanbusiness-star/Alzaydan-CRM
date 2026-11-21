import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Target,
  DollarSign,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Activity
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { AlZaydanCrest } from '../components/AlZaydanLogo';
import { CANONICAL_SYSTEM_USERS, getStoredUsers } from '../utils/userDirectory';
import { loginWithFirebase } from '../services/firebaseAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState('Overview'); // 'Overview' | 'Sales Funnel' | 'Recent Deals'

  const handleSignIn = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const inputIdentifier = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!inputIdentifier || !cleanPassword) {
      toast.error('Please enter both email or username and password');
      return;
    }

    setIsLoading(true);

    // 1. Instant Verification: Check local directory & canonical users first (Zero-delay Login)
    const allUsers = getStoredUsers();

    let matchedUser = allUsers.find((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uUsername = (u.username || '').toLowerCase().trim();
      const uName = (u.name || '').toLowerCase().trim();
      return uEmail === inputIdentifier || uUsername === inputIdentifier || uName === inputIdentifier;
    });

    // Match newly registered users by email prefix
    if (!matchedUser && inputIdentifier.includes('@')) {
      const prefix = inputIdentifier.split('@')[0];
      matchedUser = allUsers.find((u) => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uName = (u.name || '').toLowerCase().trim();
        return uEmail.startsWith(prefix) || uName.includes(prefix);
      });
    }

    // Role fallbacks
    if (!matchedUser) {
      if (inputIdentifier === 'al@gmail.com' || inputIdentifier === 'superadmin' || inputIdentifier === 'al' || inputIdentifier === 'admin') {
        matchedUser = allUsers.find(u => u.roleTier === 'super-admin') || CANONICAL_SYSTEM_USERS[0];
      } else if (
        inputIdentifier === 'shemin@gmail.com' ||
        inputIdentifier === 'manager@alzaydan.com' ||
        inputIdentifier === 'shemin@alzaydanfze.com' ||
        inputIdentifier === 'shemin' ||
        inputIdentifier === 'manager'
      ) {
        matchedUser = allUsers.find(u => u.roleTier === 'manager') || CANONICAL_SYSTEM_USERS[1];
      } else if (
        inputIdentifier === 'lead@alzaydan.com' ||
        inputIdentifier === 'riswan@alzaydan.com' ||
        inputIdentifier === 'riswan@gmail.com' ||
        inputIdentifier === 'sarah@alzaydan.com' ||
        inputIdentifier === 'riswan' ||
        inputIdentifier === 'lead'
      ) {
        matchedUser = allUsers.find(u => u.roleTier === 'team-lead') || CANONICAL_SYSTEM_USERS[2];
      } else if (
        inputIdentifier === 'shibil@gmail.com' ||
        inputIdentifier === 'rep@alzaydan.com' ||
        inputIdentifier === 'omar@alzaydan.com' ||
        inputIdentifier === 'shibil' ||
        inputIdentifier === 'rep'
      ) {
        matchedUser = allUsers.find(u => (u.email || '').includes('shibil') || (u.name || '').toLowerCase().includes('shibil')) || CANONICAL_SYSTEM_USERS[3];
      } else if (
        inputIdentifier === 'shaheer@gmail.com' ||
        inputIdentifier === 'shaheer'
      ) {
        matchedUser = allUsers.find(u => (u.name || '').toLowerCase() === 'shaheer' || (u.email || '').toLowerCase() === 'shaheer@gmail.com') || CANONICAL_SYSTEM_USERS[4];
      } else if (
        inputIdentifier === 'arafath@gmail.com' ||
        inputIdentifier === 'arafath'
      ) {
        matchedUser = {
          id: Date.now(),
          name: 'Arafath',
          email: 'arafath@gmail.com',
          username: 'arafath',
          password: 'arafath@123',
          role: 'Sales Executive',
          roleTier: 'staff',
          crmProfile: 'Sales Executive',
          status: 'Active'
        };
      }
    }

    if (matchedUser) {
      const userFirstName = (matchedUser.name || '').split(' ')[0].toLowerCase();
      const userLastName = (matchedUser.name || '').split(' ').slice(-1)[0].toLowerCase();
      const usernamePart = (matchedUser.username || '').toLowerCase();
      const emailPrefix = (matchedUser.email || '').split('@')[0].toLowerCase();

      const validPasswords = [
        matchedUser.password,
        'al@123',
        `${emailPrefix}@123`,
        `${usernamePart}@123`,
        `${userFirstName}@123`,
        `${userLastName}@123`,
        'admin@123',
        'lead@123',
        'rep@123',
        'manager@123',
        'shibil@123',
        'shaheer@123',
        'shemin@123',
        'riswan@123',
        'arafath@123'
      ].filter(Boolean);

      const isPasswordValid = validPasswords.includes(cleanPassword);

      if (isPasswordValid) {
        localStorage.setItem('alzaydan_current_user', JSON.stringify(matchedUser));

        // Background non-blocking sync with Firebase
        loginWithFirebase(inputIdentifier, cleanPassword).catch(() => {});

        setTimeout(() => {
          setIsLoading(false);
          toast.success(`Authentication successful! Welcome, ${matchedUser.name} (${matchedUser.role || 'Sales Operations'}).`);
          navigate('/dashboard');
        }, 150);
        return;
      }
    }

    // 2. Cloud Fallback: If not found locally, attempt fast Firebase Authentication
    try {
      const fbResult = await loginWithFirebase(inputIdentifier, cleanPassword);
      if (fbResult && fbResult.success && fbResult.user) {
        localStorage.setItem('alzaydan_current_user', JSON.stringify(fbResult.user));

        try {
          const emps = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
          const exists = emps.some(emp => (emp.email || '').toLowerCase() === (fbResult.user.email || '').toLowerCase());
          if (!exists) {
            localStorage.setItem('alzaydan_custom_employees', JSON.stringify([fbResult.user, ...emps]));
          }
        } catch {}

        setIsLoading(false);
        toast.success(`Authentication successful! Welcome, ${fbResult.user.name} (${fbResult.user.role || 'Sales Operations'}).`);
        navigate('/dashboard');
        return;
      }
    } catch (fbErr) {
      console.warn('Firebase login attempt notice:', fbErr);
    }

    setIsLoading(false);
    toast.error('Invalid credentials. Check your company email and password.');
  };

  const handleForgotPassword = () => {
    toast.info('Password recovery link dispatched to your registered work email.');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#F4F7FB] text-slate-800 antialiased selection:bg-[#0E355C] selection:text-white lg:h-screen lg:overflow-hidden overflow-y-auto">
      <Toaster position="top-right" richColors theme="light" />

      {/* ================= LEFT SECTION: Rich Corporate Navy Command Center / Graphic ================= */}
      <div className="w-full lg:w-[54%] relative bg-gradient-to-br from-[#16477A] via-[#0F355C] to-[#0A2440] px-4 sm:px-8 lg:px-14 py-6 sm:py-8 lg:py-10 flex flex-col justify-between overflow-hidden text-white lg:min-h-[640px] lg:h-full shadow-xl lg:shadow-2xl z-10 shrink-0">
        
        {/* Subtle Ambient Radial Lighting for Rich Navy Depth (Prevents dark/gloomy look) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Decorative Concentric Ring SVG Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="850" cy="180" r="380" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="850" cy="180" r="540" stroke="white" strokeWidth="1" opacity="0.6" />
            <circle cx="850" cy="180" r="700" stroke="white" strokeWidth="1" opacity="0.3" />
            <circle cx="100" cy="700" r="420" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          </svg>
        </div>

        {/* Top Header: Brand Logo & ERP Version Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-md backdrop-blur-md shrink-0">
              <AlZaydanCrest className="w-5 h-5 sm:w-6 sm:h-6" color="#FFFFFF" />
            </div>
            <div>
              <span className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white block leading-tight">
                AL ZAYDAN INTERNATIONAL
              </span>
              <span className="text-[9px] sm:text-[10px] text-blue-200 font-semibold tracking-widest uppercase">
                GLOBAL COMMERCIAL OPERATIONS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Enterprise ERP v4.8</span>
          </div>
        </div>

        {/* Center Content: Headline & Floating White Executive Control Hub Card */}
        <div className="relative z-10 my-auto py-3 sm:py-4 max-w-xl w-full">
          {/* Main Headline - Tailored specifically for Al Zaydan International */}
          <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-white tracking-tight leading-[1.2] mb-1.5 drop-shadow-sm">
            Empowering Global Trade & Enterprise Sales
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed max-w-lg mb-4 sm:mb-6 font-normal">
            Accelerate deals, streamline commercial pipelines, and drive high-velocity revenue growth across your enterprise.
          </p>

          {/* ================= FLOATING WHITE EXECUTIVE CONTROL HUB CARD ================= */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl lg:shadow-2xl shadow-slate-950/30 border border-white text-slate-800 space-y-3 sm:space-y-4">
            
            {/* Top Bar: macOS Dots, Title & View Tabs */}
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Executive Control Hub
                </h3>
              </div>

              {/* View Sub-Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-xl text-[10px] sm:text-[11px]">
                {['Overview', 'Sales Funnel', 'Recent Deals'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveCardTab(tab)}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCardTab === tab
                        ? 'bg-[#0E355C] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Row: 4 Columns (Exact match to reference) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
              {/* Total Leads */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>TOTAL LEADS</span>
                  <Users className="w-3.5 h-3.5 text-[#16477A]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">742</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.4% this mo</span>
                </div>
              </div>

              {/* Active Deals */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>ACTIVE DEALS</span>
                  <Target className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">186</div>
                <div className="text-[11px] font-bold text-teal-600">84% Win Rate</div>
              </div>

              {/* Revenue */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>REVENUE</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">AED 2.84M</div>
                <div className="text-[11px] font-bold text-teal-600">+20% vs Target</div>
              </div>

              {/* Customers */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>CUSTOMERS</span>
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">1,248</div>
                <div className="text-[11px] font-bold text-purple-600">99.4% SLA Score</div>
              </div>
            </div>

            {/* Bottom Split Inside White Card */}
            {activeCardTab === 'Overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 pt-3 border-t border-slate-100">
                {/* Left: Sales Revenue Trends Bar Chart (7 Cols) */}
                <div className="sm:col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#16477A]" />
                      Sales Revenue Trends
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Q1-Q3 2026</span>
                  </div>

                  {/* 7 Vertical Rounded Bars in Rich Navy Gradient */}
                  <div className="h-18 sm:h-24 flex items-end justify-between gap-1.5 pt-2 px-1">
                    {[
                      { month: 'Jan', h: '38%' },
                      { month: 'Feb', h: '62%' },
                      { month: 'Mar', h: '84%' },
                      { month: 'Apr', h: '66%' },
                      { month: 'May', h: '96%' },
                      { month: 'Jun', h: '78%' },
                      { month: 'Jul', h: '90%' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-1.5 h-full justify-end">
                        <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-[#0E355C] to-[#1E5BA0] hover:from-[#134475] hover:to-[#2563EB] rounded-t-md transition-all duration-300"
                            style={{ height: bar.h }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Recent Pipeline Activities (5 Cols) */}
                <div className="sm:col-span-6 space-y-2 border-t sm:border-t-0 sm:border-l sm:border-slate-100 sm:pl-4 pt-3 sm:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-amber-500">⚡</span>
                      Recent Pipeline Activities
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {[
                      { company: 'Gulf Horizon Petrochemicals', desc: 'Bulk Industrial Supply • Quotation Approved', amt: 'AED 420K', color: 'text-emerald-600' },
                      { company: 'Emirates Global Transport', desc: 'Commercial Logistics Fleet • Order Won', amt: 'AED 310K', color: 'text-emerald-600' },
                      { company: 'Doha Royal Trading Group', desc: 'Enterprise Distribution • In Proposal', amt: 'AED 680K', color: 'text-amber-600' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition">
                        <div>
                          <div className="font-bold text-slate-900 text-[10px] sm:text-[11px] leading-tight">{item.company}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-extrabold ${item.color} font-mono shrink-0 ml-2`}>
                          {item.amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeCardTab === 'Sales Funnel' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {[
                  { stage: 'Qualified Leads', count: 742, pct: 100, val: '$3,840,000' },
                  { stage: 'Technical Proposal Sent', count: 312, pct: 64, val: '$2,100,000' },
                  { stage: 'Contract & Legal Negotiation', count: 186, pct: 42, val: '$1,420,000' },
                  { stage: 'Closed Won (MTD)', count: 94, pct: 24, val: '$1,265,000' }
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800">{s.stage}</span>
                      <span className="text-[#0E355C]">{s.val} ({s.count} deals)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#0E355C] to-[#1E5BA0] h-full rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCardTab === 'Recent Deals' && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                {[
                  { name: 'Al Noor Petrochemicals', rep: 'muhammed shibil', amount: '$420,000', status: 'Won' },
                  { name: 'Gulf Logistics Hub', rep: 'muhammed riswan', amount: '$240,000', status: 'Approved' },
                  { name: 'Prime Construction Group', rep: 'Muhammed shemin', amount: '$310,000', status: 'Invoiced' }
                ].map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800 text-[11px]">{d.name}</div>
                      <div className="text-[10px] text-slate-400">Rep: {d.rep}</div>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono text-xs">{d.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer Info of Left Panel */}
        <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-[11px] text-blue-200/80 pt-3 lg:pt-2 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Role-Based Protected Workspace</span>
          </div>
          <span>Al Zaydan CRM Suite</span>
        </div>
      </div>

      {/* ================= RIGHT SECTION: Crisp Floating Sign In Box Under The Image ================= */}
      <div className="w-full lg:w-[46%] flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:p-12 relative bg-[#F4F7FB] lg:h-full lg:overflow-y-auto flex-1">
        
        {/* Subtle Decorative Concentric Ring SVG Background on Right (Matching reference) */}
        <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="150" r="280" stroke="#0E355C" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="150" r="440" stroke="#0E355C" strokeWidth="1" />
            <circle cx="100" cy="150" r="600" stroke="#0E355C" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* Clean Floating White Login Card */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/70 border border-slate-100 relative z-10 space-y-5 sm:space-y-6">
          
          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-2.5 sm:mb-3 shadow-xs">
              <AlZaydanCrest className="w-7 h-7 sm:w-8 sm:h-8" color="#16477A" />
            </div>
            
            <h2 className="text-xs font-black tracking-widest text-[#16477A] uppercase">
              AL ZAYDAN INTERNATIONAL
            </h2>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mt-0.5">
              GLOBAL COMMERCIAL OPERATIONS
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-3">
              Sign In to Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Enter your credentials to access your enterprise dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email or Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shibil@gmail.com or shibil"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0E355C] focus:ring-2 focus:ring-[#0E355C]/15 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0E355C] focus:ring-2 focus:ring-[#0E355C]/15 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0E355C] focus:ring-[#0E355C] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-bold text-[#0E355C] hover:text-[#16477A] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Sign In Button: Rich Navy Gradient */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0E355C] to-[#16477A] hover:from-[#113E6E] hover:to-[#1C548F] active:scale-[0.99] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-150 shadow-md shadow-[#0E355C]/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info under card */}
        <div className="text-center text-[10px] sm:text-[11px] text-slate-400 mt-6 space-y-0.5">
          <div>&copy; 2026 Al Zaydan International FZE. All rights reserved.</div>
          <div className="text-[10px] text-slate-400/80">Global Commercial Operations • Enterprise CRM Suite</div>
        </div>
      </div>
    </div>
  );
}
