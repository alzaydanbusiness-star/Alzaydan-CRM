import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff, ShieldCheck, Mail, Lock, Target, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTeamLeadModal({ isOpen, onClose, onAddTeamLead, currentManagerName = 'Muhammed shemin' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    teamName: '',
    department: 'Commercial & High-Rise HVAC',
    target: '450000',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    
    setFormData(prev => ({ ...prev, mobile: val }));

    if (val.length > 0 && !val.startsWith('5')) {
      setPhoneError('UAE mobile number must start with 5 (e.g. 50, 52, 54, 55, 56, 58)');
    } else if (val.length > 0 && val.length < 9) {
      setPhoneError('Enter complete 9-digit UAE number');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter the Team Lead full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid work email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.mobile || formData.mobile.length !== 9 || !formData.mobile.startsWith('5')) {
      toast.error('Please enter a valid 9-digit UAE mobile number starting with 5');
      return;
    }

    if (!formData.teamName.trim()) {
      toast.error('Please specify an assigned team name or division');
      return;
    }

    const targetNum = Number(formData.target) || 450000;
    const formattedPhone = `+971 ${formData.mobile.slice(0, 2)} ${formData.mobile.slice(2, 5)} ${formData.mobile.slice(5)}`;

    const newTeamLeadEmployee = {
      id: `emp-tl-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      mobile: formattedPhone,
      phone: formattedPhone,
      role: 'Team Lead',
      crmProfile: 'Team Lead',
      roleTier: 'team-lead',
      department: formData.department,
      assignedTeam: formData.teamName.trim(),
      reportsTo: currentManagerName,
      target: targetNum,
      closedSales: 0,
      pipelineValue: 0,
      dealsCount: 0,
      winRate: 0,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // 1. Save to custom employees so this Team Lead can log in via /login
    try {
      const existing = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
      const filtered = existing.filter(u => (u.email || '').toLowerCase() !== newTeamLeadEmployee.email);
      filtered.push(newTeamLeadEmployee);
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify(filtered));
    } catch {
      // ignore
    }

    // 2. Build team representation for Manager Dashboard
    const newTeamObject = {
      id: `team-${Date.now()}`,
      name: formData.teamName.trim(),
      lead: formData.name.trim(),
      leadEmail: formData.email.trim().toLowerCase(),
      leadPhone: formattedPhone,
      target: targetNum,
      closedSales: 0,
      pipelineValue: 0,
      dealsCount: 0,
      winRate: 0,
      status: 'Onboarding',
      department: formData.department,
      executives: []
    };

    onAddTeamLead(newTeamObject, newTeamLeadEmployee);
    toast.success(`Team Lead "${formData.name}" added successfully! They can now log in at /login with their email and password.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-[#063056] to-[#0D3B66] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Add New Team Lead
              </h3>
              <p className="text-[11px] text-slate-200 mt-0.5">
                Assign a Team Lead reporting directly to you ({currentManagerName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Fatima Al-Zahra"
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent"
            />
          </div>

          {/* Email and Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@alzaydan.com"
                  className="w-full text-xs p-3 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Login Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full text-xs p-3 pl-9 pr-9 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* UAE Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              UAE Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                AE +971
              </div>
              <input
                type="text"
                value={formData.mobile}
                onChange={handlePhoneChange}
                placeholder="50 123 4567"
                maxLength={9}
                className={`flex-1 text-xs p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] ${
                  phoneError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>
            {phoneError ? (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{phoneError}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">9 digits starting with 5 (e.g. 50 123 4567)</p>
            )}
          </div>

          {/* Assigned Team / Division Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assigned Team / Division Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                placeholder="e.g. Team 4 (Delta) - Infrastructure Projects"
                className="w-full text-xs p-3 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent"
              />
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Department & Quota Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] bg-white cursor-pointer"
              >
                <option value="Commercial & High-Rise HVAC">Commercial & High-Rise HVAC</option>
                <option value="Enterprise & Industrial Cooling">Enterprise & Industrial Cooling</option>
                <option value="Government & Hospitality Projects">Government & Hospitality Projects</option>
                <option value="Retail & Commercial Fitouts">Retail & Commercial Fitouts</option>
                <option value="Service & Maintenance Contracts">Service & Maintenance Contracts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monthly Quota Target (AED)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="450000"
                  className="w-full text-xs p-3 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063056] focus:border-transparent"
                />
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Role hierarchy confirmation pill */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Hierarchy Assignment:</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                This user is assigned the <strong>Team Lead</strong> tier and reports directly to <strong>{currentManagerName}</strong>. They will manage their own sales reps and lead assignments.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#063056] hover:bg-[#094173] transition shadow-md shadow-blue-900/20 cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Create Team Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
