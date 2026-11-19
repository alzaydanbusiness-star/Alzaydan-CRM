import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Building2,
  Shield,
  DollarSign,
  Phone,
  X,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [position, setPosition] = useState('Senior Sales Executive');
  const [department, setDepartment] = useState('Sales Team');
  const [roleTier, setRoleTier] = useState('Sales Executive');
  const [target, setTarget] = useState('$450,000');
  const [phone, setPhone] = useState('+971 50 821 4490');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter employee full name');
      return;
    }

    const generatedEmail = email.trim() || `${name.toLowerCase().trim().replace(/\s+/g, '.')}@alzaydan.com`;
    const finalPassword = password || 'al@123';

    const newEmployee = {
      id: Date.now(),
      name: name.trim(),
      email: generatedEmail,
      password: finalPassword,
      role: position.trim() || 'Sales Executive',
      position: position.trim() || 'Sales Executive',
      department,
      roleTier,
      phone: phone.trim(),
      target: target.startsWith('$') ? target : `$${target}`,
      sales: '$0',
      status: 'Active'
    };

    // Save to localStorage so they can immediately sign in on the login page!
    try {
      const existing = JSON.parse(localStorage.getItem('alzaydan_custom_employees') || '[]');
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify([newEmployee, ...existing]));
    } catch {
      // ignore
    }

    onAddEmployee(newEmployee);
    toast.success(`Employee "${newEmployee.name}" (${newEmployee.position}) registered with login credentials!`);

    // Reset Form
    setName('');
    setEmail('');
    setPassword('');
    setPosition('Senior Sales Executive');
    setDepartment('Sales Team');
    setRoleTier('Sales Executive');
    setTarget('$450,000');
    setPhone('+971 50 821 4490');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#063056]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Add New Employee & Provision Access
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register employee profile, assigned position, and portal login credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Full Name & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] focus:ring-2 focus:ring-[#063056]/15 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Position / Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Sales Executive"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] focus:ring-2 focus:ring-[#063056]/15 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Work Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alzaydan.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] focus:ring-2 focus:ring-[#063056]/15 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Login Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for default (al@123)"
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] focus:ring-2 focus:ring-[#063056]/15 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Department & Role Tier (RBAC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none transition cursor-pointer"
                >
                  <option value="Sales Team">Sales Team</option>
                  <option value="Commercial Enterprise">Commercial Enterprise</option>
                  <option value="Key Accounts">Key Accounts</option>
                  <option value="Fleet Logistics">Fleet Logistics</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role-Based Access Level (Tier)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </span>
                <select
                  value={roleTier}
                  onChange={(e) => setRoleTier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none transition cursor-pointer"
                >
                  <option value="Sales Executive">Tier 4: Sales Executive (SE Portal)</option>
                  <option value="Team Lead">Tier 3: Team Lead (Unit Command)</option>
                  <option value="Sales Manager">Tier 2: Sales Manager (Dept Head)</option>
                  <option value="Super Admin">Tier 1: Super Admin (Full Control)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Sales Target & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Sales Target
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="$450,000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Contact Phone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E] shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Employee Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
