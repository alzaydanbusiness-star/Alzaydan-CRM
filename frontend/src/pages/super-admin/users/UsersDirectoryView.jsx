import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RotateCw,
  Plus,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit2,
  KeyRound,
  Trash2,
  X,
  CheckCircle2,
  User,
  Calendar,
  ArrowLeft,
  Info,
  Check,
  AlertCircle,
  Network,
  FolderPlus,
  Smartphone,
  Monitor,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';
import { createFirebaseUser, syncFirestoreUsers } from '../../../services/firebaseAuth';
import { fetchUsersFromApi, saveUserToApi } from '../../../api/crmApi';
import {
  getStoredUsers,
  saveStoredUsers,
  addStoredUser,
  unDeleteUser,
  canManageUsers,
  isSalesExecutive,
  deleteStoredUser
} from '../../../utils/userDirectory';

// Clean raw input to extract national 9-digit UAE mobile (5XXXXXXXX)
const cleanUAEMobileDigits = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  if (str.startsWith('+971')) str = str.slice(4);
  else if (str.startsWith('00971')) str = str.slice(5);
  else if (str.startsWith('971') && str.length > 9) str = str.slice(3);

  let digits = str.replace(/\D/g, '');

  if (digits.length >= 11 && digits.startsWith('971')) {
    digits = digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith('05')) {
    digits = digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith('9715')) {
    digits = digits.slice(3);
  } else if (digits.length === 9 && digits.startsWith('971')) {
    // If phone was saved with 971 prefix chopped from international format
    digits = digits.slice(3);
  }

  return digits.slice(0, 9);
};

// UAE Mobile Number Formatter & Validator (+971 5X XXX XXXX)
const formatUAEMobileNumber = (val) => {
  const digits = cleanUAEMobileDigits(val);
  if (digits.length <= 2) return { raw: digits, formatted: digits };
  if (digits.length <= 5) return { raw: digits, formatted: `${digits.slice(0, 2)} ${digits.slice(2)}` };
  return { raw: digits, formatted: `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}` };
};

const getUAEMobileValidation = (val) => {
  const digits = cleanUAEMobileDigits(val);
  if (!digits) {
    return { status: 'idle', message: 'Format: 50 123 4567 (9 digits)' };
  }
  if (!digits.startsWith('5')) {
    return {
      status: 'error',
      message: 'UAE mobile numbers must start with 5 (e.g. 50, 52, 54, 55, 56, 58)'
    };
  }
  if (digits.length < 9) {
    return {
      status: 'warning',
      message: `${digits.length}/9 digits entered (${9 - digits.length} more needed)`
    };
  }
  return {
    status: 'valid',
    message: 'Valid UAE mobile number'
  };
};

const CURRENT_YEAR = new Date().getFullYear();
const DOB_YEARS = Array.from({ length: CURRENT_YEAR - 1940 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to calculate exact age in years from DD-MM-YYYY
const calculateAge = (dobString) => {
  if (!dobString || !/^\d{2}-\d{2}-\d{4}$/.test(dobString)) return null;
  const [d, m, y] = dobString.split('-').map(Number);
  const birthDate = new Date(y, m - 1, d);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const mDiff = today.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 && age < 120 ? age : null;
};

// DOB Interactive Date Picker Popover Component
function DobDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);

  // Parse existing value "DD-MM-YYYY"
  const parsedDate = useMemo(() => {
    if (value && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [_d, m, y] = value.split('-').map(Number);
      return { day: Number(_d), month: m - 1, year: y };
    }
    return null;
  }, [value]);

  // Calendar view year and month
  const [viewYear, setViewYear] = useState(() => (parsedDate ? parsedDate.year : 2000));
  const [viewMonth, setViewMonth] = useState(() => (parsedDate ? parsedDate.month : 0));

  // Dynamic position check: open upward if near bottom of screen
  const checkPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Calendar height is ~330px; if space below < 340px and space above is larger, flip upward
      setOpenUpward(spaceBelow < 340 && spaceAbove > 260);
    }
  }, []);

  // Open & sync calendar view
  const handleToggleCalendar = () => {
    if (!isOpen) {
      checkPosition();
      if (parsedDate) {
        setViewYear(parsedDate.year);
        setViewMonth(parsedDate.month);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Keep position updated on scroll/resize and auto-scroll into view when opened
  useEffect(() => {
    if (!isOpen) return;

    checkPosition();
    const handleScrollOrResize = () => checkPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      clearTimeout(timer);
    };
  }, [isOpen, checkPosition]);

  // Click outside to dismiss calendar popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Days count & start weekday in current view
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Wheel scroll navigation: scrolling on calendar navigates months smoothly
  const handleWheel = (e) => {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'select') return;
    if (e.deltaY < 0) {
      handlePrevMonth();
    } else if (e.deltaY > 0) {
      handleNextMonth();
    }
  };

  const handleSelectDay = (day) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(viewMonth + 1).padStart(2, '0');
    const yyyy = viewYear;
    onChange(`${dd}-${mm}-${yyyy}`);
    setIsOpen(false);
  };

  // Auto-hyphenating typing handler for DD-MM-YYYY
  const handleInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
    onChange(formatted);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          maxLength={10}
          value={value}
          onChange={handleInputChange}
          className="w-full h-9 pl-3 pr-16 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-600 text-xs font-bold cursor-pointer rounded"
              title="Clear date"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleCalendar}
            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open Calendar Picker"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Dropdown Popover with dynamic upward/downward flip & smooth scroll */}
      {isOpen && (
        <div
          onWheel={handleWheel}
          className={`absolute left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[70] animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-1.5'
          }`}
        >
          {/* Header: Month & Year Selectors + Nav Arrows */}
          <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {DOB_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isSelected =
                parsedDate &&
                parsedDate.day === day &&
                parsedDate.month === viewMonth &&
                parsedDate.year === viewYear;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#011635] text-white shadow-2xs font-bold'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer: Quick Actions */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                onChange(`${dd}-${mm}-${today.getFullYear()}`);
                setIsOpen(false);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to determine role tier in the corporate reporting hierarchy: 'super-admin' | 'manager' | 'team-lead' | 'staff'
const getUserRoleTier = (profile, designation, position) => {
  const p = (profile || '').toLowerCase().trim();
  const d = (designation || '').toLowerCase().trim();
  const pos = (position || '').toLowerCase().trim();

  // Helper: check if a title belongs to top Executive / Super Admin / CEO
  // Note: Individual contributor roles like "Sales Executive", "Account Executive", "Marketing Executive", "Procurement Executive" are STAFF, NOT Super Admin!
  const isCSuite = (str) => {
    if (!str) return false;
    if (str.includes('super admin') || str === 'ceo' || str.includes('chief executive')) return true;
    if (str.includes('executive / ceo') || str.includes('ceo / executive') || str === 'executive') return true;
    if (
      str.includes('executive') &&
      !str.includes('sales') &&
      !str.includes('account') &&
      !str.includes('market') &&
      !str.includes('procure') &&
      !str.includes('support') &&
      !str.includes('business dev') &&
      !str.includes('operations') &&
      !str.includes('field')
    ) {
      return true;
    }
    return false;
  };

  if (isCSuite(p) || isCSuite(d) || isCSuite(pos)) {
    return 'super-admin';
  }

  // Manager tier (e.g. Sales Manager, Department Manager, Finance Controller, Senior Management)
  if (
    p.includes('manager') ||
    d.includes('manager') ||
    pos.includes('manager') ||
    p.includes('controller') ||
    d.includes('controller') ||
    pos.includes('management') ||
    p.includes('management')
  ) {
    return 'manager';
  }

  // Team Lead tier
  if (p.includes('lead') || d.includes('lead') || pos.includes('lead')) {
    return 'team-lead';
  }

  // Staff tier (Sales Executive, Coordinator, Rep, Officer, Accountant, etc.)
  return 'staff';
};

export default function UsersDirectoryView() {
  // View mode: 'list' (Users Directory Table) | 'create' (Add User) | 'edit' (Edit User) | 'detail' (Full User Details View matching Image 2)
  const [viewMode, setViewMode] = useState('list');
  const [detailSubTab, setDetailSubTab] = useState('user'); // 'user' | 'expense'

  // Sub-bar Filter States (Matching Reference Image 1)
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('Active'); // 'All' | 'Active' | 'Inactive'
  const [profileFilter, setProfileFilter] = useState('All Profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionId, setActiveActionId] = useState(null);

  // Modals / Details
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const handleViewUserDetail = (user) => {
    setSelectedUserDetail(user);
    setViewMode('detail');
    setDetailSubTab('user');
    setActiveActionId(null);
  };

  // Form State for Add User
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    showPassword: false,
    imagePreview: null,
    mobilePrefix: '+971',
    mobileNumber: '',
    dob: '',
    organizationalPosition: '',
    reportsTo: 'Team Lead',
    crmProfile: 'Sales Executive',
    department: '',
    designation: 'Sales Executive',
    permissionsExpanded: false,
    permissions: {
      leads: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
      quotations: { view: true, create: true, edit: true, delete: false },
      salesOrders: { view: true, create: true, edit: true, delete: false },
      taxInvoices: { view: true, create: true, edit: false, delete: false },
      receipts: { view: true, create: true, edit: false, delete: false },
      deliveryNotes: { view: true, create: true, edit: false, delete: false },
      purchase: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false }
    }
  });

  // Real-time Mobile Number Validation State
  const mobileValidation = useMemo(
    () => getUAEMobileValidation(newUserForm.mobileNumber),
    [newUserForm.mobileNumber]
  );

  // Dynamic Options States (Configured & extended via "+ Add New")
  const [positionOptions, setPositionOptions] = useState([
    'Finance Controller (Manager • Finance)',
    'Executive / CEO',
    'Department Manager',
    'Team Lead',
    'Senior Management',
    'Sales Department',
    'Operations & Logistics',
    'Accounts & Finance',
    'Procurement & Warehouse'
  ]);

  const [crmProfileOptions, setCrmProfileOptions] = useState([
    'Employee',
    'Super Admin',
    'Manager',
    'Team Lead',
    'Sales Executive',
    'Sales Coordinator',
    'Procurement Specialist',
    'Accountant'
  ]);

  const [departmentOptions, setDepartmentOptions] = useState([
    'Finance',
    'Management',
    'Sales & Marketing',
    'HVAC Operations',
    'Warehouse & Logistics',
    'Finance & Accounts',
    'Procurement'
  ]);

  const [designationOptions, setDesignationOptions] = useState([
    'Sales Executive',
    'Finance Controller',
    'Sales Manager',
    'Team Lead',
    'Senior Sales Consultant',
    'Project Engineer',
    'Logistics Officer',
    'Procurement Executive',
    'Accountant'
  ]);

  const [opportunityOptions, setOpportunityOptions] = useState([
    'All Works',
    'Commercial HVAC',
    'VRF / VRV Systems',
    'Chiller Plants & Ducts',
    'Maintenance Contracts',
    'Ventilation & Exhaust'
  ]);

  // Form State for Edit User (Identical to Add User Structure)
  const [editUserForm, setEditUserForm] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    showPassword: false,
    imagePreview: null,
    mobilePrefix: '+971',
    mobileNumber: '',
    dob: '',
    organizationalPosition: '',
    reportsTo: 'Super Admin (CEO)',
    crmProfile: 'Sales Executive',
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'Active',
    permissionsExpanded: false,
    permissions: {
      leads: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
      quotations: { view: true, create: true, edit: true, delete: false },
      salesOrders: { view: true, create: true, edit: true, delete: false },
      taxInvoices: { view: true, create: true, edit: false, delete: false },
      receipts: { view: true, create: true, edit: false, delete: false },
      deliveryNotes: { view: true, create: true, edit: false, delete: false },
      purchase: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false }
    }
  });

  // Real-time Mobile Number Validation State for Edit Form
  const editMobileValidation = useMemo(
    () => getUAEMobileValidation(editUserForm.mobileNumber),
    [editUserForm.mobileNumber]
  );

  // Dynamic Age calculation for DOB badges
  const editAge = useMemo(() => calculateAge(editUserForm.dob), [editUserForm.dob]);
  const newAge = useMemo(() => calculateAge(newUserForm.dob), [newUserForm.dob]);

  // "+ Add New" Modal State
  const [addOptionModal, setAddOptionModal] = useState({
    isOpen: false,
    field: '',
    title: '',
    label: '',
    placeholder: '',
    inputValue: '',
    description: ''
  });

  // Hierarchy Structure Modal State
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);

  // Handler for adding a new item from the "+ Add New" dialog
  const handleSaveNewOption = (e) => {
    e.preventDefault();
    const val = (addOptionModal.inputValue || '').trim();
    if (!val) {
      toast.error(`Please enter a valid ${addOptionModal.label.toLowerCase()}`);
      return;
    }

    const { field } = addOptionModal;
    const isEdit = viewMode === 'edit';
    const updateForm = isEdit ? setEditUserForm : setNewUserForm;

    if (field === 'position') {
      if (!positionOptions.includes(val)) {
        setPositionOptions((prev) => [...prev, val]);
      }
      updateForm((prev) => ({ ...prev, organizationalPosition: val }));
    } else if (field === 'crmProfile') {
      if (!crmProfileOptions.includes(val)) {
        setCrmProfileOptions((prev) => [...prev, val]);
      }
      updateForm((prev) => ({ ...prev, crmProfile: val }));
    } else if (field === 'department') {
      if (!departmentOptions.includes(val)) {
        setDepartmentOptions((prev) => [...prev, val]);
      }
      updateForm((prev) => ({ ...prev, department: val }));
    } else if (field === 'designation') {
      if (!designationOptions.includes(val)) {
        setDesignationOptions((prev) => [...prev, val]);
      }
      updateForm((prev) => ({ ...prev, designation: val }));
    } else if (field === 'opportunity') {
      if (!opportunityOptions.includes(val)) {
        setOpportunityOptions((prev) => [...prev, val]);
      }
      updateForm((prev) => ({ ...prev, businessOpportunity: val }));
    }

    toast.success(`"${val}" added and selected successfully!`);
    setAddOptionModal({
      isOpen: false,
      field: '',
      title: '',
      label: '',
      placeholder: '',
      inputValue: '',
      description: ''
    });
  };

  // Live Users Directory (Always preserves canonical real team users, synced with localStorage)
  const [users, setUsers] = useState(() => getStoredUsers());

  // Listen for storage changes across other browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || e.key === 'alzaydan_custom_employees') {
        setUsers(getStoredUsers());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Pull cloud users from Firestore into local directory on mount
  useEffect(() => {
    syncFirestoreUsers().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers((prev) => {
          const merged = [...prev];
          let hasNew = false;
          cloudUsers.forEach((cu) => {
            const cuEmail = (cu.email || '').toLowerCase().trim();
            const exists = merged.some(
              (m) => (m.email && m.email.toLowerCase().trim() === cuEmail) || m.id === cu.id
            );
            if (!exists) {
              merged.push(cu);
              hasNew = true;
            }
          });
          if (hasNew) {
            saveStoredUsers(merged);
          }
          return merged;
        });
      }
    }).catch(() => {});

    // Sync from Cloudflare D1 on mount
    fetchUsersFromApi()
      .then((apiUsers) => {
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          setUsers((prev) => {
            const merged = [...prev];
            let hasNew = false;
            apiUsers.forEach((au) => {
              const auEmail = (au.email || '').toLowerCase().trim();
              const exists = merged.some(
                (m) => (m.email && m.email.toLowerCase().trim() === auEmail) || m.id === au.id
              );
              if (!exists) {
                merged.push({
                  id: au.id,
                  name: au.name,
                  email: au.email,
                  role: au.role,
                  designation: au.designation || 'Sales Executive',
                  phone: au.mobile || '+971 50 000 0000',
                  status: au.status || 'Active',
                  avatarBg: 'bg-[#011635] text-white',
                  avatarText: (au.name || 'U')[0].toUpperCase()
                });
                hasNew = true;
              }
            });
            if (hasNew) {
              saveStoredUsers(merged);
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Hierarchy Tier Derivations
  const currentTier = useMemo(() => {
    return getUserRoleTier(
      newUserForm.crmProfile,
      newUserForm.designation,
      newUserForm.organizationalPosition
    );
  }, [newUserForm.crmProfile, newUserForm.designation, newUserForm.organizationalPosition]);

  const editTier = useMemo(() => {
    return getUserRoleTier(
      editUserForm.crmProfile,
      editUserForm.designation,
      editUserForm.organizationalPosition
    );
  }, [editUserForm.crmProfile, editUserForm.designation, editUserForm.organizationalPosition]);

  // Synchronize Reports To automatically when Profile/Position changes in Add User
  const handleProfileChange = (newProfile) => {
    const tier = getUserRoleTier(newProfile, newUserForm.designation, newUserForm.organizationalPosition);
    let nextReportsTo = newUserForm.reportsTo;
    if (tier === 'super-admin') {
      nextReportsTo = 'Board of Directors';
    } else if (tier === 'manager') {
      nextReportsTo = 'Super Admin (CEO)';
    } else if (tier === 'team-lead') {
      if (nextReportsTo !== 'Manager' && nextReportsTo !== 'Super Admin (CEO)') {
        nextReportsTo = 'Manager';
      }
    } else {
      if (!['Team Lead', 'Manager', 'Super Admin (CEO)'].includes(nextReportsTo)) {
        nextReportsTo = 'Team Lead';
      }
    }
    setNewUserForm((prev) => ({
      ...prev,
      crmProfile: newProfile,
      reportsTo: nextReportsTo
    }));
  };

  const handlePositionChange = (newPos) => {
    const tier = getUserRoleTier(newUserForm.crmProfile, newUserForm.designation, newPos);
    let nextReportsTo = newUserForm.reportsTo;
    if (tier === 'super-admin') {
      nextReportsTo = 'Board of Directors';
    } else if (tier === 'manager') {
      nextReportsTo = 'Super Admin (CEO)';
    } else if (tier === 'team-lead') {
      if (nextReportsTo !== 'Manager' && nextReportsTo !== 'Super Admin (CEO)') {
        nextReportsTo = 'Manager';
      }
    } else {
      if (!['Team Lead', 'Manager', 'Super Admin (CEO)'].includes(nextReportsTo)) {
        nextReportsTo = 'Team Lead';
      }
    }
    setNewUserForm((prev) => ({
      ...prev,
      organizationalPosition: newPos,
      reportsTo: nextReportsTo
    }));
  };

  // Synchronize Reports To automatically when Profile/Position changes in Edit User
  const handleEditProfileChange = (newProfile) => {
    const tier = getUserRoleTier(newProfile, editUserForm.designation, editUserForm.organizationalPosition);
    let nextReportsTo = editUserForm.reportsTo;
    if (tier === 'super-admin') {
      nextReportsTo = 'Board of Directors';
    } else if (tier === 'manager') {
      nextReportsTo = 'Super Admin (CEO)';
    } else if (tier === 'team-lead') {
      if (nextReportsTo !== 'Manager' && nextReportsTo !== 'Super Admin (CEO)') {
        nextReportsTo = 'Manager';
      }
    } else {
      if (!['Team Lead', 'Manager', 'Super Admin (CEO)'].includes(nextReportsTo)) {
        nextReportsTo = 'Team Lead';
      }
    }
    setEditUserForm((prev) => ({
      ...prev,
      crmProfile: newProfile,
      reportsTo: nextReportsTo
    }));
  };

  const handleEditPositionChange = (newPos) => {
    const tier = getUserRoleTier(editUserForm.crmProfile, editUserForm.designation, newPos);
    let nextReportsTo = editUserForm.reportsTo;
    if (tier === 'super-admin') {
      nextReportsTo = 'Board of Directors';
    } else if (tier === 'manager') {
      nextReportsTo = 'Super Admin (CEO)';
    } else if (tier === 'team-lead') {
      if (nextReportsTo !== 'Manager' && nextReportsTo !== 'Super Admin (CEO)') {
        nextReportsTo = 'Manager';
      }
    } else {
      if (!['Team Lead', 'Manager', 'Super Admin (CEO)'].includes(nextReportsTo)) {
        nextReportsTo = 'Team Lead';
      }
    }
    setEditUserForm((prev) => ({
      ...prev,
      organizationalPosition: newPos,
      reportsTo: nextReportsTo
    }));
  };

  // Profile Roles Options for Filter
  const profileOptions = [
    'All Profiles',
    'CEO',
    'COO',
    'Finance Controller',
    'Operation Manager',
    'Sales Executive',
    'Senior Sales Exec',
    'Sales Lead',
    'Procurement Manager',
    'Purchase Manager'
  ];

  // Refresh handler
  const handleRefresh = () => {
    const refreshed = getStoredUsers();
    setUsers(refreshed);
    toast.success('Users Directory synchronized with latest server records');
  };

  // Active logged-in user session for RBAC Hierarchy Clearance
  const currentUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('alzaydan_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const viewerTier = (currentUser?.roleTier || '').toLowerCase();
  const viewerRole = `${currentUser?.role || ''} ${currentUser?.designation || ''} ${currentUser?.position || ''}`.toLowerCase();
  const viewerEmail = (currentUser?.email || '').toLowerCase();

  // Determine viewer hierarchy level
  const isViewerSuperAdmin =
    !currentUser ||
    viewerEmail === 'al@gmail.com' ||
    viewerTier === 'super-admin' ||
    viewerRole.includes('super admin') ||
    viewerRole.includes('ceo');

  const isViewerManager =
    !isViewerSuperAdmin && (viewerTier === 'manager' || viewerRole.includes('manager') || viewerRole.includes('controller'));

  const isViewerTeamLead =
    !isViewerSuperAdmin && !isViewerManager && (viewerTier === 'team-lead' || viewerRole.includes('lead'));

  const isViewerStaff = !isViewerSuperAdmin && !isViewerManager && !isViewerTeamLead;

  // Filter Logic with Strict Corporate RBAC Visibility Rules:
  // 1. Super Admin sees ALL (Super Admin, Managers, Team Leads, Staff)
  // 2. Manager DOES NOT see Super Admin (only sees Managers, Team Leads, Staff)
  // 3. Team Lead DOES NOT see Manager & DOES NOT see Super Admin (only sees Team Leads, Staff)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const targetTier = (
        u.roleTier ||
        getUserRoleTier(u.crmProfile || u.role, u.designation, u.organizationalPosition)
      ).toLowerCase();
      const targetRole = `${u.role || ''} ${u.designation || ''} ${u.crmProfile || ''} ${u.organizationalPosition || ''}`.toLowerCase();

      const isTargetSuperAdmin =
        targetTier === 'super-admin' ||
        (u.email && u.email.toLowerCase() === 'al@gmail.com') ||
        targetRole.includes('super admin') ||
        targetRole.includes('ceo');

      const isTargetManager =
        !isTargetSuperAdmin &&
        (targetTier === 'manager' || targetRole.includes('manager') || targetRole.includes('controller'));

      const isTargetLead =
        !isTargetSuperAdmin &&
        !isTargetManager &&
        (targetTier === 'team-lead' || targetRole.includes('lead'));

      // Hierarchy Rule 1: Super Admin can see all users
      if (isViewerSuperAdmin) {
        // Full visibility
      }
      // Hierarchy Rule 2: Manager cannot see Super Admin
      else if (isViewerManager) {
        if (isTargetSuperAdmin) return false;
      }
      // Hierarchy Rule 3: Team Lead cannot see Super Admin and cannot see Manager
      else if (isViewerTeamLead) {
        if (isTargetSuperAdmin || isTargetManager) return false;
      }
      // Hierarchy Rule 4: Staff only sees staff
      else if (isViewerStaff) {
        if (isTargetSuperAdmin || isTargetManager || isTargetLead) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        const itemStatus = (u.status || 'Active').toLowerCase();
        if (itemStatus !== statusFilter.toLowerCase()) return false;
      }

      // Profile filter
      if (profileFilter !== 'All Profiles') {
        const itemProfile = (u.crmProfile || u.role || '').toLowerCase();
        if (itemProfile !== profileFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchRole = (u.role || u.crmProfile || '').toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        const matchRep = (u.reportsTo || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchDept && !matchRep) return false;
      }

      return true;
    });
  }, [
    users,
    statusFilter,
    profileFilter,
    searchQuery,
    isViewerSuperAdmin,
    isViewerManager,
    isViewerTeamLead,
    isViewerStaff
  ]);

  // Pagination calculation
  const totalEntries = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentRows = filteredUsers.slice(startIndex, endIndex);

  // Add User Form Submission
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) {
      toast.error('Please enter full name');
      return;
    }
    if (!newUserForm.email.trim()) {
      toast.error('Please enter work email address');
      return;
    }
    if (!newUserForm.password || newUserForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Mobile Number Validation
    const rawMobile = (newUserForm.mobileNumber || '').replace(/\D/g, '');
    if (rawMobile.length > 0) {
      if (!rawMobile.startsWith('5')) {
        toast.error('UAE mobile numbers must start with 5 (e.g. 50, 52, 54, 55, 56, 58)');
        return;
      }
      if (rawMobile.length !== 9) {
        toast.error(`Incomplete mobile number: 9 digits required (${rawMobile.length} entered)`);
        return;
      }
    }

    // Generate unique timestamp ID so it NEVER collides with small integer IDs
    const newId = Date.now();
    const initial = newUserForm.name.trim().slice(0, 2).toUpperCase();
    const createdTier = getUserRoleTier(
      newUserForm.crmProfile,
      newUserForm.designation,
      newUserForm.organizationalPosition
    );

    const created = {
      id: newId,
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      username: newUserForm.email.trim().split('@')[0],
      password: newUserForm.password, // Saved for RBAC separate login
      role: newUserForm.crmProfile || newUserForm.designation || 'Sales Executive',
      roleTier: createdTier, // 'manager' | 'team-lead' | 'staff'
      crmProfile: newUserForm.crmProfile || 'Employee',
      organizationalPosition: newUserForm.organizationalPosition || '',
      designation: newUserForm.designation || 'Sales Executive',
      department: newUserForm.department || 'Sales',
      reportsTo: newUserForm.reportsTo || 'Super Admin (CEO)',
      reportingManager: newUserForm.reportsTo || 'Super Admin (CEO)',
      employeeType: newUserForm.crmProfile || 'Sales Executive',
      status: 'Active',
      avatarBg: 'bg-[#003579] text-white',
      avatarText: initial,
      isImage: Boolean(newUserForm.imagePreview),
      image: newUserForm.imagePreview || null,
      avatar: newUserForm.imagePreview || null,
      phone: `${newUserForm.mobilePrefix} ${newUserForm.mobileNumber || '50 123 4567'}`,
      mobileNumber: newUserForm.mobileNumber,
      dob: newUserForm.dob || '',
      permissions: newUserForm.permissions,
      joinDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
    };

    // 1. Add user safely to storage (un-deletes, prepends, saves to localStorage, and updates current user)
    const updatedUsers = addStoredUser(created);
    setUsers(updatedUsers);

    // 2. Automatically register and sync user with Firebase cloud authentication
    createFirebaseUser({
      email: created.email,
      password: created.password,
      userData: created
    }).then((res) => {
      if (res.success) {
        toast.success(`User "${created.name}" synchronized with Firebase cloud authentication!`);
      }
    }).catch((err) => {
      console.warn('Firebase user creation notice:', err);
    });

    toast.success(`User "${created.name}" created successfully!`);
    setViewMode('list');

    setNewUserForm({
      name: '',
      email: '',
      password: '',
      showPassword: false,
      imagePreview: null,
      mobilePrefix: '+971',
      mobileNumber: '',
      dob: '',
      organizationalPosition: '',
      reportsTo: 'Team Lead',
      crmProfile: 'Sales Executive',
      department: '',
      designation: 'Sales Executive',
      permissionsExpanded: false,
      permissions: {
        leads: { view: true, create: true, edit: true, delete: false },
        customers: { view: true, create: true, edit: true, delete: false },
        quotations: { view: true, create: true, edit: true, delete: false },
        salesOrders: { view: true, create: true, edit: true, delete: false },
        taxInvoices: { view: true, create: true, edit: false, delete: false },
        receipts: { view: true, create: true, edit: false, delete: false },
        deliveryNotes: { view: true, create: true, edit: false, delete: false },
        purchase: { view: false, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false }
      }
    });
  };

  // Initialize and open Edit User full view matching Add User Layout
  const handleStartEditUser = (user) => {
    const rawMobile = user.mobileNumber || user.phone || '';
    const nationalDigits = cleanUAEMobileDigits(rawMobile);
    const { formatted } = formatUAEMobileNumber(nationalDigits);

    const tier = getUserRoleTier(
      user.crmProfile || user.role,
      user.designation,
      user.organizationalPosition || user.position
    );

    let posVal = user.organizationalPosition || user.position || '';
    if (!posVal) {
      if (tier === 'super-admin') posVal = 'Executive / CEO';
      else if (tier === 'manager') posVal = 'Department Manager';
      else if (tier === 'team-lead') posVal = 'Team Lead';
      else posVal = 'Sales Department';
    }
    // Make sure positionOptions contains posVal
    if (posVal) {
      setPositionOptions((prev) => (prev.includes(posVal) ? prev : [...prev, posVal]));
    }

    let profileVal = user.crmProfile || user.role || '';
    if (!profileVal) {
      if (tier === 'super-admin') profileVal = 'Super Admin';
      else if (tier === 'manager') profileVal = 'Manager';
      else if (tier === 'team-lead') profileVal = 'Team Lead';
      else profileVal = 'Sales Executive';
    }
    // Make sure crmProfileOptions contains profileVal
    if (profileVal) {
      setCrmProfileOptions((prev) => (prev.includes(profileVal) ? prev : [...prev, profileVal]));
    }

    let deptVal = user.department || '';
    if (!deptVal) {
      deptVal = tier === 'super-admin' ? 'Executive Management' : 'Sales & Marketing';
    }
    if (deptVal) {
      setDepartmentOptions((prev) => (prev.includes(deptVal) ? prev : [...prev, deptVal]));
    }

    let desigVal = user.designation || user.role || 'Sales Executive';
    if (desigVal) {
      setDesignationOptions((prev) => (prev.includes(desigVal) ? prev : [...prev, desigVal]));
    }

    let validReportsTo = user.reportsTo;
    if (tier === 'super-admin') {
      validReportsTo = 'Board of Directors';
    } else if (tier === 'manager') {
      validReportsTo = 'Super Admin (CEO)';
    } else if (tier === 'team-lead') {
      validReportsTo = validReportsTo === 'Super Admin (CEO)' ? 'Super Admin (CEO)' : 'Manager';
    } else {
      if (!['Team Lead', 'Manager', 'Super Admin (CEO)'].includes(validReportsTo)) {
        validReportsTo = 'Team Lead';
      }
    }

    setEditUserForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '',
      showPassword: false,
      imagePreview: user.isImage && user.image ? user.image : user.avatar || null,
      mobilePrefix: user.mobilePrefix || '+971',
      mobileNumber: formatted,
      dob: user.dob || '',
      organizationalPosition: posVal,
      reportsTo: validReportsTo,
      crmProfile: profileVal,
      department: deptVal,
      designation: desigVal,
      status: user.status || 'Active',
      permissionsExpanded: false,
      permissions: user.permissions || {
        leads: { view: true, create: true, edit: true, delete: false },
        customers: { view: true, create: true, edit: true, delete: false },
        quotations: { view: true, create: true, edit: true, delete: false },
        salesOrders: { view: true, create: true, edit: true, delete: false },
        taxInvoices: { view: true, create: true, edit: false, delete: false },
        receipts: { view: true, create: true, edit: false, delete: false },
        deliveryNotes: { view: true, create: true, edit: false, delete: false },
        purchase: { view: false, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false }
      }
    });
    setViewMode('edit');
    setActiveActionId(null);
    setSelectedUserDetail(user);
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result;
        if (result) {
          setEditUserForm((prev) => ({
            ...prev,
            imagePreview: result
          }));
          toast.success(`Selected image: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    if (!editUserForm.name.trim()) {
      toast.error('Please enter full name');
      return;
    }
    if (!editUserForm.email.trim()) {
      toast.error('Please enter email address');
      return;
    }

    // Clean and validate UAE mobile if entered
    const rawMobile = cleanUAEMobileDigits(editUserForm.mobileNumber);
    if (rawMobile.length > 0) {
      if (!rawMobile.startsWith('5')) {
        toast.error('UAE mobile numbers must start with 5 (e.g. 50, 52, 54, 55, 56, 58)');
        return;
      }
      if (rawMobile.length !== 9) {
        toast.error(`Incomplete mobile number: 9 digits required (${rawMobile.length} entered)`);
        return;
      }
    }

    const editTierCalculated = getUserRoleTier(
      editUserForm.crmProfile,
      editUserForm.designation,
      editUserForm.organizationalPosition
    );

    const targetPos =
      editUserForm.organizationalPosition ||
      (editTierCalculated === 'super-admin'
        ? 'Executive / CEO'
        : editTierCalculated === 'manager'
        ? 'Department Manager'
        : editTierCalculated === 'team-lead'
        ? 'Team Lead'
        : 'Sales Department');

    const targetProfile =
      editUserForm.crmProfile ||
      (editTierCalculated === 'super-admin'
        ? 'Super Admin'
        : editTierCalculated === 'manager'
        ? 'Manager'
        : editTierCalculated === 'team-lead'
        ? 'Team Lead'
        : 'Sales Executive');

    const targetDept =
      editUserForm.department ||
      (editTierCalculated === 'super-admin' ? 'Executive Management' : 'Sales & Marketing');

    const targetDesig =
      editUserForm.designation ||
      (editTierCalculated === 'manager' ? 'Sales Manager' : 'Sales Executive');

    const targetReportsTo =
      editUserForm.reportsTo ||
      (editTierCalculated === 'super-admin'
        ? 'Board of Directors'
        : editTierCalculated === 'manager'
        ? 'Super Admin (CEO)'
        : 'Team Lead');

    const formattedMobile = formatUAEMobileNumber(rawMobile).formatted;

    try {
      const updated = users.map((u) => {
        const isMatch =
          String(u.id) === String(editUserForm.id) ||
          (u.email && u.email.toLowerCase().trim() === editUserForm.email.toLowerCase().trim());

        if (isMatch) {
          const initial = editUserForm.name
            .trim()
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return {
            ...u,
            name: editUserForm.name.trim(),
            email: editUserForm.email.trim(),
            username: editUserForm.email.trim().split('@')[0],
            password: editUserForm.password && editUserForm.password.length >= 6 ? editUserForm.password : u.password,
            role: targetProfile || targetDesig,
            roleTier: editTierCalculated,
            crmProfile: targetProfile,
            organizationalPosition: targetPos,
            department: targetDept,
            designation: targetDesig,
            reportsTo: targetReportsTo,
            reportingManager: targetReportsTo,
            phone: formattedMobile ? `+971 ${formattedMobile}` : (u.phone || '+971 50 123 4567'),
            mobileNumber: formattedMobile || u.mobileNumber,
            mobilePrefix: '+971',
            dob: editUserForm.dob || u.dob,
            isImage: Boolean(editUserForm.imagePreview),
            image: editUserForm.imagePreview,
            avatar: editUserForm.imagePreview,
            avatarText: initial || 'U',
            status: editUserForm.status || 'Active',
            permissions: editUserForm.permissions
          };
        }
        return u;
      });

      setUsers(updated);
      saveStoredUsers(updated);

      toast.success(`User "${editUserForm.name}" updated successfully!`);
      if (selectedUserDetail) {
        setSelectedUserDetail((prev) => ({
          ...(prev || {}),
          name: editUserForm.name.trim(),
          email: editUserForm.email.trim(),
          username: editUserForm.email.trim().split('@')[0],
          role: targetProfile || targetDesig,
          roleTier: editTierCalculated,
          crmProfile: targetProfile,
          organizationalPosition: targetPos,
          department: targetDept,
          designation: targetDesig,
          reportsTo: targetReportsTo,
          reportingManager: targetReportsTo,
          phone: formattedMobile ? `+971 ${formattedMobile}` : (prev?.phone || '+971 50 123 4567'),
          mobileNumber: formattedMobile || prev?.mobileNumber,
          dob: editUserForm.dob || prev?.dob,
          isImage: Boolean(editUserForm.imagePreview),
          image: editUserForm.imagePreview,
          avatar: editUserForm.imagePreview,
          status: editUserForm.status || 'Active',
          permissions: editUserForm.permissions
        }));
        setViewMode('detail');
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const handleDeleteUser = (id) => {
    const target = users.find((u) => u.id === id);
    if (
      target &&
      ((target.email && target.email.toLowerCase() === 'al@gmail.com') ||
        target.roleTier === 'super-admin' ||
        (target.role && target.role.toLowerCase().includes('super admin')))
    ) {
      toast.error('Super Admin root account is system-protected and cannot be deleted.');
      setActiveActionId(null);
      return;
    }

    if (target) {
      deleteStoredUser(target.id, target.email, target.name);
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveStoredUsers(updated);
    setActiveActionId(null);
    toast.success(`User "${target?.name || 'Account'}" permanently removed.`);
  };

  const handleToggleStatus = (id) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`User status changed to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);
    setActiveActionId(null);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* 1. USERS DIRECTORY CONTAINER CARD (viewMode === 'list')        */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* Top Header: [👥 Users Directory] [🔄 Refresh] [+ + USER]     */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Users Directory
            </h2>
            {isViewerSuperAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Super Admin Clearance (All Roles Visible)
              </span>
            )}
            {isViewerManager && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Manager Clearance (Super Admin Hidden)
              </span>
            )}
            {isViewerTeamLead && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Team Lead Clearance (Super Admin & Managers Hidden)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh Button (Matching Reference Image) */}
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>

            {/* + + USER Button (Green Button Matching Reference Image - Admin & Managers Only) */}
            {canManageUsers() && (
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ + USER</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar Controls (Matching Image 1: Show Rows, Status, Profile, Search) */}
        <div className="p-3.5 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/40">
          {/* Left Dropdowns: Show Rows, Status, Profile */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Show Rows */}
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Show</span>
              <div className="relative inline-block">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 pl-2.5 pr-7 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2.5 pointer-events-none" />
              </div>
              <span>Rows</span>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Status:</span>
              <div className="relative inline-block">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 pl-2.5 pr-7 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="All">All</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Profile:</span>
              <div className="relative inline-block">
                <select
                  value={profileFilter}
                  onChange={(e) => {
                    setProfileFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 pl-2.5 pr-7 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 appearance-none cursor-pointer"
                >
                  {profileOptions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search user..."
              className="w-full h-8.5 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Table View (Matching Image 1 Columns Exactly) */}
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 tracking-tight">
                <th className="py-3 px-4 w-12 text-center">SL.No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4 text-center">Position / Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Reports To</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No users found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or search keywords</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRows.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors group text-slate-700"
                  >
                    {/* SL.No */}
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {startIndex + index + 1}
                    </td>

                    {/* Name with Avatar */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewUserDetail(user)}
                        className="flex items-center gap-2.5 text-left group/user cursor-pointer focus:outline-hidden"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 transition-transform group-hover/user:scale-105 ${
                            user.isImage && user.image ? 'border border-slate-200 bg-white' : user.avatarBg
                          }`}
                        >
                          {user.isImage && user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.avatarText
                          )}
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight group-hover/user:text-blue-600 group-hover/user:underline">
                          {user.name}
                        </span>
                      </button>
                    </td>

                    {/* Email ID */}
                    <td className="py-3 px-4 font-normal text-slate-600">
                      {user.email}
                    </td>

                    {/* Position / Role (Blue Pill Badge) */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {user.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {user.department}
                    </td>

                    {/* Reports To */}
                    <td className="py-3 px-4 font-normal text-slate-600">
                      {user.reportsTo}
                    </td>

                    {/* Status (Active in Emerald) */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold text-xs ${
                          user.status === 'Active'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions Button (Teal Gear ⚙️ ▾ - Admin & Managers Only) */}
                    <td className="py-3 px-4 text-center relative">
                      {canManageUsers() ? (
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveActionId(activeActionId === user.id ? null : user.id)
                            }
                            className="h-7 w-7 rounded-md bg-[#0F766E] hover:bg-[#115E59] text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeActionId === user.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  handleViewUserDetail(user);
                                }}
                                className="w-full px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>View User Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleStartEditUser(user);
                                }}
                                className="w-full px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit User</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  toast.info(`Password reset link sent to ${user.email}`);
                                  setActiveActionId(null);
                                }}
                                className="w-full px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reset Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user.id)}
                                className="w-full px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>
                                  {user.status === 'Active' ? 'Mark Inactive' : 'Mark Active'}
                                </span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              {(user.email && user.email.toLowerCase() === 'al@gmail.com') ||
                              user.roleTier === 'super-admin' ||
                              (user.role && user.role.toLowerCase().includes('super admin')) ? (
                                <div className="px-3.5 py-1.5 text-[11px] text-slate-400 italic">
                                  Root CEO (Protected)
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full px-3.5 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} users
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* 2. FULL VIEW: ADD USER (Matching Reference Image 2 Exactly)    */}
      {/* ============================================================== */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 shadow-2xs rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Add User
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Back to Users Directory"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200/60 shadow-2xs"
                title="Close form"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAddUserSubmit} className="p-5 sm:p-6 space-y-6 pb-48 sm:pb-56">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* 2. Email ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <span title="Work email address of the user" className="text-slate-400 hover:text-slate-600 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="user@alzaydan.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* 4. Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={newUserForm.showPassword ? 'text' : 'password'}
                      placeholder="Enter password (min. 6 chars)"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full h-9 pl-3 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewUserForm({ ...newUserForm, showPassword: !newUserForm.showPassword })
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {newUserForm.showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. Image */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Image
                    </label>
                    <span title="User profile picture" className="text-slate-400 hover:text-slate-600 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {newUserForm.imagePreview ? (
                      <div className="relative group">
                        <img
                          src={newUserForm.imagePreview}
                          alt="User avatar preview"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setNewUserForm((prev) => ({ ...prev, imagePreview: null }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg select-none">
                        ?
                      </div>
                    )}
                    <label className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs">
                      {newUserForm.imagePreview ? 'Change Image' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              toast.error('Please select an image file');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result;
                              if (result) {
                                setNewUserForm((prev) => ({
                                  ...prev,
                                  imagePreview: result
                                }));
                                toast.success(`Selected image: ${file.name}`);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 6. Mobile Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mobile Number
                    </label>
                    <span className="text-[11px] text-slate-400">
                      UAE (+971) 9 Digits
                    </span>
                  </div>
                  <div
                    className={`flex rounded-lg overflow-hidden border transition-all ${
                      mobileValidation.status === 'valid'
                        ? 'border-emerald-500 focus-within:border-emerald-500 ring-2 ring-emerald-500/10'
                        : mobileValidation.status === 'error'
                        ? 'border-red-500 focus-within:border-red-500 ring-2 ring-red-500/10'
                        : mobileValidation.status === 'warning'
                        ? 'border-amber-400 focus-within:border-blue-500'
                        : 'border-slate-200 focus-within:border-blue-500'
                    }`}
                  >
                    <div className="bg-slate-50 px-2.5 border-r border-slate-200 flex items-center select-none">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        AE +971
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      maxLength={11}
                      value={newUserForm.mobileNumber}
                      onChange={(e) => {
                        const { formatted } = formatUAEMobileNumber(e.target.value);
                        setNewUserForm((prev) => ({ ...prev, mobileNumber: formatted }));
                      }}
                      className="flex-1 h-9 px-3 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                    />
                    {/* Status Indicator Icon */}
                    <div className="flex items-center pr-3 shrink-0">
                      {mobileValidation.status === 'valid' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {mobileValidation.status === 'error' && (
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                      )}
                      {mobileValidation.status === 'warning' && (
                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {newUserForm.mobileNumber.replace(/\D/g, '').length}/9
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="flex items-center justify-between text-[11px] px-0.5">
                    <span
                      className={`flex items-center gap-1 ${
                        mobileValidation.status === 'valid'
                          ? 'text-emerald-600 font-medium'
                          : mobileValidation.status === 'error'
                          ? 'text-red-500 font-medium'
                          : mobileValidation.status === 'warning'
                          ? 'text-amber-600 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {mobileValidation.status === 'valid' && <Check className="w-3 h-3 stroke-[2.5]" />}
                      {mobileValidation.status === 'error' && <AlertCircle className="w-3 h-3 shrink-0" />}
                      <span>{mobileValidation.message}</span>
                    </span>

                    {newUserForm.mobileNumber && (
                      <button
                        type="button"
                        onClick={() => setNewUserForm((prev) => ({ ...prev, mobileNumber: '' }))}
                        className="text-slate-400 hover:text-slate-600 text-[10px] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* 7. DOB */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      DOB
                    </label>
                    {newAge !== null && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Age: {newAge} yrs
                      </span>
                    )}
                  </div>
                  <DobDatePicker
                    value={newUserForm.dob}
                    onChange={(val) => setNewUserForm((prev) => ({ ...prev, dob: val }))}
                  />
                  <p className="text-[11px] text-slate-400">Format: DD-MM-YYYY (Click calendar icon to pick date)</p>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* 1. Organizational Position */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Organizational Position <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setAddOptionModal({
                            isOpen: true,
                            field: 'position',
                            title: 'Add Organizational Position',
                            label: 'Position Name',
                            placeholder: 'e.g. Field Technical Operations',
                            inputValue: '',
                            description: 'Add a new organizational corporate division to the company hierarchy.'
                          })
                        }
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        + Add New
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIsHierarchyModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        Hierarchy Structure
                      </button>
                    </div>
                  </div>
                  <select
                    value={newUserForm.organizationalPosition}
                    onChange={(e) => handlePositionChange(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">Select Position</option>
                    {positionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Reports To / Manager */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reports To / Manager <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {currentTier === 'super-admin'
                        ? 'Super Admin Tier → Board of Directors'
                        : currentTier === 'manager'
                        ? 'Manager Tier → CEO'
                        : currentTier === 'team-lead'
                        ? 'Team Lead Tier → Manager / CEO'
                        : 'Staff Tier → Team Lead / Manager / CEO'}
                    </span>
                  </div>
                  <select
                    value={
                      newUserForm.reportsTo ||
                      (currentTier === 'super-admin'
                        ? 'Board of Directors'
                        : currentTier === 'manager'
                        ? 'Super Admin (CEO)'
                        : currentTier === 'team-lead'
                        ? 'Manager'
                        : 'Team Lead')
                    }
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, reportsTo: e.target.value })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                    required
                  >
                    {/* 1. Super Admin Tier */}
                    {currentTier === 'super-admin' && (
                      <option value="Board of Directors">Board of Directors</option>
                    )}

                    {/* 2. Manager Tier */}
                    {currentTier === 'manager' && (
                      <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                    )}

                    {/* 3. Team Lead Tier */}
                    {currentTier === 'team-lead' && (
                      <>
                        <option value="Manager">Manager</option>
                        <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                      </>
                    )}

                    {/* 4. Staff Tier / Fallback for all roles */}
                    {(currentTier === 'staff' || (!['super-admin', 'manager', 'team-lead'].includes(currentTier))) && (
                      <>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Manager">Manager</option>
                        <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                        {users
                          .filter((u) => u.roleTier === 'manager' || u.roleTier === 'team-lead')
                          .map((u) => (
                            <option key={`new-mgr-${u.id}`} value={`${u.name} (${u.role || u.crmProfile || 'Lead'})`}>
                              {u.name} ({u.role || u.crmProfile || 'Lead'})
                            </option>
                          ))}
                      </>
                    )}

                    {/* Custom fallback option if a non-standard reportsTo was stored */}
                    {newUserForm.reportsTo && ![
                      'Board of Directors',
                      'Super Admin (CEO)',
                      'Manager',
                      'Team Lead',
                      ...users.filter((u) => u.roleTier === 'manager' || u.roleTier === 'team-lead').map((u) => `${u.name} (${u.role || u.crmProfile || 'Lead'})`)
                    ].includes(newUserForm.reportsTo) && (
                      <option value={newUserForm.reportsTo}>{newUserForm.reportsTo}</option>
                    )}
                  </select>

                  {/* Hierarchy Rule Helper */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {currentTier === 'super-admin' && 'Hierarchy Rule: Super Admin reports directly to Board of Directors'}
                      {currentTier === 'manager' && 'Hierarchy Rule: Manager reports directly to Super Admin (CEO)'}
                      {currentTier === 'team-lead' && 'Hierarchy Rule: Team Lead reports to Manager or Super Admin (CEO)'}
                      {(currentTier === 'staff' || (!['super-admin', 'manager', 'team-lead'].includes(currentTier))) && 'Hierarchy Rule: Staff members report to Team Lead, Manager, or Super Admin (CEO)'}
                    </span>
                  </div>
                </div>

                {/* 3. CRM Profile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      CRM Profile <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddOptionModal({
                          isOpen: true,
                          field: 'crmProfile',
                          title: 'Add CRM Profile',
                          label: 'Profile Role Name',
                          placeholder: 'e.g. Regional Sales Lead, Support Lead',
                          inputValue: '',
                          description: 'Create a new CRM role profile for permissions and access configuration.'
                        })
                      }
                      className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={newUserForm.crmProfile}
                    onChange={(e) => handleProfileChange(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">Select Profile</option>
                    {crmProfileOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Department */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddOptionModal({
                          isOpen: true,
                          field: 'department',
                          title: 'Add Department',
                          label: 'Department Name',
                          placeholder: 'e.g. Quality Assurance, Client Relations',
                          inputValue: '',
                          description: 'Define a new company department for employee categorization.'
                        })
                      }
                      className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={newUserForm.department}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, department: e.target.value })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Access Control & Permissions Banner */}
            <div className="mt-8 rounded-xl border border-sky-100 bg-[#f0f9ff] overflow-hidden">
              <div className="p-3.5 sm:px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Access Control, Granular Permissions & Reporting Manager
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNewUserForm({
                      ...newUserForm,
                      permissionsExpanded: !newUserForm.permissionsExpanded
                    })
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Configure Permissions & Manager
                  {newUserForm.permissionsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {newUserForm.permissionsExpanded && (
                <div className="p-4 bg-white border-t border-sky-100 text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                          <th className="pb-2">Module</th>
                          <th className="pb-2 text-center">View</th>
                          <th className="pb-2 text-center">Create</th>
                          <th className="pb-2 text-center">Edit</th>
                          <th className="pb-2 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { key: 'leads', name: 'Leads' },
                          { key: 'customers', name: 'Customers' },
                          { key: 'quotations', name: 'Quotations' },
                          { key: 'salesOrders', name: 'Sales Orders' },
                          { key: 'taxInvoices', name: 'Tax Invoices' },
                          { key: 'receipts', name: 'Receipts' },
                          { key: 'deliveryNotes', name: 'Delivery Notes' },
                          { key: 'purchase', name: 'Purchase' },
                          { key: 'reports', name: 'Reports' }
                        ].map((mod) => (
                          <tr key={mod.key} className="hover:bg-slate-50/50">
                            <td className="py-2 font-medium text-slate-700">{mod.name}</td>
                            {['view', 'create', 'edit', 'delete'].map((action) => (
                              <td key={action} className="py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={newUserForm.permissions?.[mod.key]?.[action] ?? false}
                                  onChange={(e) => {
                                    setNewUserForm({
                                      ...newUserForm,
                                      permissions: {
                                        ...newUserForm.permissions,
                                        [mod.key]: {
                                          ...newUserForm.permissions[mod.key],
                                          [action]: e.target.checked
                                        }
                                      }
                                    });
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (Aligned to Right) */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#063056] hover:bg-[#021f3f] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2b. FULL VIEW: EDIT USER (Mirroring Add User Structure)        */}
      {/* ============================================================== */}
      {viewMode === 'edit' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          {/* Header (Sticky with Closing Arrow on Top Right) */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 shadow-2xs rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <Edit2 className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Edit User
              </h2>
              {editUserForm.name && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {editUserForm.name} ({editUserForm.email})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (selectedUserDetail ? setViewMode('detail') : setViewMode('list'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Back to Users Directory"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => (selectedUserDetail ? setViewMode('detail') : setViewMode('list'))}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200/60 shadow-2xs"
                title="Close edit"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEditUserSubmit} noValidate className="p-5 sm:p-6 space-y-6 pb-48 sm:pb-56">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* 2. Email ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <span title="User email address" className="text-slate-400 hover:text-slate-600 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="user@alzaydan.com"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* 3. Password (Optional on edit) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-slate-400 font-normal">(Leave blank to keep existing password)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={editUserForm.showPassword ? 'text' : 'password'}
                      placeholder="Leave blank to preserve existing password"
                      value={editUserForm.password}
                      onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                      className="w-full h-9 pl-3 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditUserForm({ ...editUserForm, showPassword: !editUserForm.showPassword })
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {editUserForm.showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. Image */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Image
                    </label>
                    <span title="User profile picture" className="text-slate-400 hover:text-slate-600 cursor-help">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {editUserForm.imagePreview ? (
                      <div className="relative group">
                        <img
                          src={editUserForm.imagePreview}
                          alt="User avatar preview"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setEditUserForm((prev) => ({ ...prev, imagePreview: null }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg select-none">
                        ?
                      </div>
                    )}
                    <label className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs">
                      {editUserForm.imagePreview ? 'Change Image' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* 5. Mobile Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mobile Number
                    </label>
                    <span className="text-[11px] text-slate-400">
                      UAE (+971) 9 Digits
                    </span>
                  </div>
                  <div
                    className={`flex rounded-lg overflow-hidden border transition-all ${
                      editMobileValidation.status === 'valid'
                        ? 'border-emerald-500 focus-within:border-emerald-500 ring-2 ring-emerald-500/10'
                        : editMobileValidation.status === 'error'
                        ? 'border-red-500 focus-within:border-red-500 ring-2 ring-red-500/10'
                        : editMobileValidation.status === 'warning'
                        ? 'border-amber-400 focus-within:border-blue-500'
                        : 'border-slate-200 focus-within:border-blue-500'
                    }`}
                  >
                    <div className="bg-slate-50 px-2.5 border-r border-slate-200 flex items-center select-none">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        AE +971
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      maxLength={11}
                      value={editUserForm.mobileNumber}
                      onChange={(e) => {
                        const { formatted } = formatUAEMobileNumber(e.target.value);
                        setEditUserForm((prev) => ({ ...prev, mobileNumber: formatted }));
                      }}
                      className="flex-1 h-9 px-3 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                    />
                    {/* Status Indicator Icon */}
                    <div className="flex items-center pr-3 shrink-0">
                      {editMobileValidation.status === 'valid' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {editMobileValidation.status === 'error' && (
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                      )}
                      {editMobileValidation.status === 'warning' && (
                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {editUserForm.mobileNumber.replace(/\D/g, '').length}/9
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="flex items-center justify-between text-[11px] px-0.5">
                    <span
                      className={`flex items-center gap-1 ${
                        editMobileValidation.status === 'valid'
                          ? 'text-emerald-600 font-medium'
                          : editMobileValidation.status === 'error'
                          ? 'text-red-500 font-medium'
                          : editMobileValidation.status === 'warning'
                          ? 'text-amber-600 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {editMobileValidation.status === 'valid' && <Check className="w-3 h-3 stroke-[2.5]" />}
                      {editMobileValidation.status === 'error' && <AlertCircle className="w-3 h-3 shrink-0" />}
                      <span>{editMobileValidation.message}</span>
                    </span>

                    {editUserForm.mobileNumber && (
                      <button
                        type="button"
                        onClick={() => setEditUserForm((prev) => ({ ...prev, mobileNumber: '' }))}
                        className="text-slate-400 hover:text-slate-600 text-[10px] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* 6. DOB */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      DOB
                    </label>
                    {editAge !== null && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Age: {editAge} yrs
                      </span>
                    )}
                  </div>
                  <DobDatePicker
                    value={editUserForm.dob}
                    onChange={(val) => setEditUserForm((prev) => ({ ...prev, dob: val }))}
                  />
                  <p className="text-[11px] text-slate-400">Format: DD-MM-YYYY (Click calendar icon to pick date)</p>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* 1. Organizational Position */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Organizational Position <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setAddOptionModal({
                            isOpen: true,
                            field: 'position',
                            title: 'Add Organizational Position',
                            label: 'Position Name',
                            placeholder: 'e.g. Field Technical Operations',
                            inputValue: '',
                            description: 'Add a new organizational corporate division to the company hierarchy.'
                          })
                        }
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        + Add New
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIsHierarchyModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        Hierarchy Structure
                      </button>
                    </div>
                  </div>
                  <select
                    value={editUserForm.organizationalPosition}
                    onChange={(e) => handleEditPositionChange(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">Select Position</option>
                    {positionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Reports To / Manager */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reports To / Manager <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {editTier === 'super-admin'
                        ? 'Super Admin Tier → Board of Directors'
                        : editTier === 'manager'
                        ? 'Manager Tier → CEO'
                        : editTier === 'team-lead'
                        ? 'Team Lead Tier → Manager / CEO'
                        : 'Staff Tier → Team Lead / Manager / CEO'}
                    </span>
                  </div>
                  <select
                    value={
                      editUserForm.reportsTo ||
                      (editTier === 'super-admin'
                        ? 'Board of Directors'
                        : editTier === 'manager'
                        ? 'Super Admin (CEO)'
                        : editTier === 'team-lead'
                        ? 'Manager'
                        : 'Team Lead')
                    }
                    onChange={(e) =>
                      setEditUserForm({ ...editUserForm, reportsTo: e.target.value })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {/* 1. Super Admin tier */}
                    {editTier === 'super-admin' && (
                      <option value="Board of Directors">Board of Directors</option>
                    )}

                    {/* 2. Manager tier */}
                    {editTier === 'manager' && (
                      <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                    )}

                    {/* 3. Team Lead tier */}
                    {editTier === 'team-lead' && (
                      <>
                        <option value="Manager">Manager</option>
                        <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                      </>
                    )}

                    {/* 4. Staff tier / Fallback */}
                    {(editTier === 'staff' || (!['super-admin', 'manager', 'team-lead'].includes(editTier))) && (
                      <>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Manager">Manager</option>
                        <option value="Super Admin (CEO)">Super Admin (CEO)</option>
                        {users
                          .filter((u) => u.id !== editUserForm.id && (u.roleTier === 'manager' || u.roleTier === 'team-lead'))
                          .map((u) => (
                            <option key={`edit-mgr-${u.id}`} value={`${u.name} (${u.role || u.crmProfile || 'Lead'})`}>
                              {u.name} ({u.role || u.crmProfile || 'Lead'})
                            </option>
                          ))}
                      </>
                    )}

                    {/* Custom fallback option if a non-standard reportsTo was stored */}
                    {editUserForm.reportsTo && ![
                      'Board of Directors',
                      'Super Admin (CEO)',
                      'Manager',
                      'Team Lead',
                      ...users.filter((u) => u.id !== editUserForm.id && (u.roleTier === 'manager' || u.roleTier === 'team-lead')).map((u) => `${u.name} (${u.role || u.crmProfile || 'Lead'})`)
                    ].includes(editUserForm.reportsTo) && (
                      <option value={editUserForm.reportsTo}>{editUserForm.reportsTo}</option>
                    )}
                  </select>

                  {/* Hierarchy Rule Helper */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {editTier === 'super-admin' && 'Hierarchy Rule: Super Admin (CEO) reports to Board of Directors'}
                      {editTier === 'manager' && 'Hierarchy Rule: Manager reports directly to Super Admin (CEO)'}
                      {editTier === 'team-lead' && 'Hierarchy Rule: Team Lead reports to Manager or Super Admin (CEO)'}
                      {(editTier === 'staff' || (!['super-admin', 'manager', 'team-lead'].includes(editTier))) && 'Hierarchy Rule: Staff members report to Team Lead, Manager, or Super Admin (CEO)'}
                    </span>
                  </div>
                </div>

                {/* 3. CRM Profile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      CRM Profile <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddOptionModal({
                          isOpen: true,
                          field: 'crmProfile',
                          title: 'Add CRM Profile',
                          label: 'Profile Role Name',
                          placeholder: 'e.g. Regional Sales Lead, Support Lead',
                          inputValue: '',
                          description: 'Create a new CRM role profile for permissions and access configuration.'
                        })
                      }
                      className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={editUserForm.crmProfile}
                    onChange={(e) => handleEditProfileChange(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">Select Profile</option>
                    {crmProfileOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Department */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddOptionModal({
                          isOpen: true,
                          field: 'department',
                          title: 'Add Department',
                          label: 'Department Name',
                          placeholder: 'e.g. Quality Assurance, Client Relations',
                          inputValue: '',
                          description: 'Define a new company department for employee categorization.'
                        })
                      }
                      className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={editUserForm.department}
                    onChange={(e) =>
                      setEditUserForm({ ...editUserForm, department: e.target.value })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Access Control & Permissions Banner */}
            <div className="mt-8 rounded-xl border border-sky-100 bg-[#f0f9ff] overflow-hidden">
              <div className="p-3.5 sm:px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Access Control, Granular Permissions & Reporting Manager
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditUserForm({
                      ...editUserForm,
                      permissionsExpanded: !editUserForm.permissionsExpanded
                    })
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Configure Permissions & Manager
                  {editUserForm.permissionsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {editUserForm.permissionsExpanded && (
                <div className="p-4 bg-white border-t border-sky-100 text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                          <th className="pb-2">Module</th>
                          <th className="pb-2 text-center">View</th>
                          <th className="pb-2 text-center">Create</th>
                          <th className="pb-2 text-center">Edit</th>
                          <th className="pb-2 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { key: 'leads', name: 'Leads' },
                          { key: 'customers', name: 'Customers' },
                          { key: 'quotations', name: 'Quotations' },
                          { key: 'salesOrders', name: 'Sales Orders' },
                          { key: 'taxInvoices', name: 'Tax Invoices' },
                          { key: 'receipts', name: 'Receipts' },
                          { key: 'deliveryNotes', name: 'Delivery Notes' },
                          { key: 'purchase', name: 'Purchase' },
                          { key: 'reports', name: 'Reports' }
                        ].map((mod) => (
                          <tr key={mod.key} className="hover:bg-slate-50/50">
                            <td className="py-2 font-medium text-slate-700">{mod.name}</td>
                            {['view', 'create', 'edit', 'delete'].map((action) => (
                              <td key={action} className="py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={editUserForm.permissions?.[mod.key]?.[action] ?? false}
                                  onChange={(e) => {
                                    setEditUserForm({
                                      ...editUserForm,
                                      permissions: {
                                        ...editUserForm.permissions,
                                        [mod.key]: {
                                          ...editUserForm.permissions[mod.key],
                                          [action]: e.target.checked
                                        }
                                      }
                                    });
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (Aligned to Right) */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => (selectedUserDetail ? setViewMode('detail') : setViewMode('list'))}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#063056] hover:bg-[#021f3f] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2c. FULL VIEW: USER DETAILS (Matching Reference Image 2)       */}
      {/* ============================================================== */}
      {viewMode === 'detail' && selectedUserDetail && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Top Sub-tabs (Matching Reference Image 2: [User] [User Expense]) */}
          <div className="flex items-center gap-6 border-b border-slate-200 px-1 pt-1">
            <button
              type="button"
              onClick={() => setDetailSubTab('user')}
              className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors relative cursor-pointer ${
                detailSubTab === 'user'
                  ? 'text-[#f43f5e] border-b-2 border-[#f43f5e] -mb-px'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-inherit" />
              <span>User</span>
            </button>

            <button
              type="button"
              onClick={() => setDetailSubTab('expense')}
              className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors relative cursor-pointer ${
                detailSubTab === 'expense'
                  ? 'text-[#f43f5e] border-b-2 border-[#f43f5e] -mb-px'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4 text-inherit" />
              <span>User Expense</span>
            </button>
          </div>

          {/* Main User Details Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Card Header: [👤 User Details] */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                  User Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Back to Users Directory"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Sub-tab 1: User Details (Matching Reference Image 2 2-column layout) */}
            {detailSubTab === 'user' && (
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-6 text-xs sm:text-sm">
                  {/* LEFT COLUMN */}
                  <div className="space-y-5">
                    {/* 1. Name */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Name</span>
                      <span className="font-bold text-slate-900 uppercase tracking-wide">
                        {selectedUserDetail.name}
                      </span>
                    </div>

                    {/* 2. Username */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Username</span>
                      <span className="font-medium text-slate-800 break-all">
                        {selectedUserDetail.username || selectedUserDetail.email}
                      </span>
                    </div>

                    {/* 3. Mobile Number */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Mobile Number</span>
                      </span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetail.phone || (selectedUserDetail.mobileNumber ? `+971 ${selectedUserDetail.mobileNumber}` : '+971 50 123 4567')}
                      </span>
                    </div>

                    {/* 4. DOB */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">DOB</span>
                      <span className="font-medium text-slate-800">
                        {selectedUserDetail.dob || '1995-11-23'}
                      </span>
                    </div>

                    {/* 5. Status */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Status</span>
                      <span className={`font-bold ${selectedUserDetail.status === 'Inactive' ? 'text-slate-400' : 'text-emerald-500'}`}>
                        {selectedUserDetail.status || 'Active'}
                      </span>
                    </div>

                    {/* 6. Sales Visit Add Permission */}
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Sales Visit Add Permission</span>
                      <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* 7. Assigned Stores */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Assigned Stores</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetail.assignedStores || 'All Stores'}
                      </span>
                    </div>

                    {/* 8. Login Permission */}
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Login Permission</span>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Monitor className="w-4 h-4 text-blue-500" title="Desktop Web Access Enabled" />
                        <Smartphone className="w-4 h-4 text-slate-700" title="Mobile App Access Enabled" />
                      </div>
                    </div>

                    {/* 9. Reporting Manager */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Reporting Manager</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetail.reportsTo || selectedUserDetail.reportingManager || 'Super Admin (CEO)'}
                      </span>
                    </div>

                    {/* 10. Data Scope */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Data Scope</span>
                      <span className="font-medium text-slate-800">
                        {selectedUserDetail.dataScope || (selectedUserDetail.roleTier === 'super-admin' ? 'All Company / Global' : 'Team / Department')}
                      </span>
                    </div>

                    {/* 11. ESS Account */}
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">ESS Account</span>
                      <button
                        type="button"
                        onClick={() => toast.success(`ESS account assigned for ${selectedUserDetail.name}`)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        + Assign
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-5">
                    {/* 1. Email ID */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Email ID</span>
                      <span className="font-medium text-slate-900 break-all">
                        {selectedUserDetail.email}
                      </span>
                    </div>

                    {/* 2. Designation */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Designation</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetail.designation || selectedUserDetail.role || 'Sales Manager'}
                      </span>
                    </div>

                    {/* 3. Image (Profile Photo Thumbnail Box) */}
                    <div className="flex items-start gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0 pt-1">Image</span>
                      <div className="w-14 h-14 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs flex items-center justify-center shrink-0">
                        {selectedUserDetail.image ? (
                          <img
                            src={selectedUserDetail.image}
                            alt={selectedUserDetail.name}
                            className="w-full h-full object-cover"
                          />
                        ) : selectedUserDetail.avatar && typeof selectedUserDetail.avatar === 'string' && selectedUserDetail.avatar.startsWith('data:') ? (
                          <img
                            src={selectedUserDetail.avatar}
                            alt={selectedUserDetail.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${selectedUserDetail.avatarBg || 'bg-[#011635] text-white'}`}>
                            {selectedUserDetail.avatarText || (selectedUserDetail.name ? selectedUserDetail.name.slice(0, 2).toUpperCase() : 'U')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4. Business Opportunity */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Business Opportunity</span>
                      <span className="font-semibold text-slate-900">
                        {selectedUserDetail.businessOpportunity || 'All Works'}
                      </span>
                    </div>

                    {/* 5. User Seal & Signature */}
                    <div className="flex items-start gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0 pt-1">User Seal & Signature</span>
                      <div className="w-24 h-16 border border-slate-200 rounded-md p-1.5 flex items-center justify-center bg-white shadow-2xs">
                        <div className="w-16 h-12 rounded-full border border-dashed border-slate-300 flex flex-col items-center justify-center text-[8px] font-bold text-slate-400 select-none tracking-widest text-center leading-tight">
                          <span>AL ZAYDAN</span>
                        </div>
                      </div>
                    </div>

                    {/* 6. Two Factor Authentication */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-slate-500 font-medium w-40 sm:w-48 shrink-0">Two Factor Authentication</span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#ef4444] text-white shadow-2xs">
                        Disabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: User Expense */}
            {detailSubTab === 'expense' && (
              <div className="p-12 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">No Expenses Recorded</h3>
                <p className="text-xs text-slate-400 mt-1">There are no expense records logged for {selectedUserDetail.name} yet.</p>
              </div>
            )}

            {/* Bottom Actions Bar (Matching Reference Image 2: [Edit User] [<- Back] at bottom right) */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleStartEditUser(selectedUserDetail)}
                className="px-5 py-2 bg-[#0b192c] hover:bg-[#040d1a] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                Edit User
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserDetail(null);
                  setViewMode('list');
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: ADD CUSTOM OPTION (Position, CRM Profile, Dept, etc) */}
      {/* ============================================================== */}
      {addOptionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 bg-[#011635] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">{addOptionModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAddOptionModal((prev) => ({ ...prev, isOpen: false, inputValue: '' }))
                }
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewOption} className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                {addOptionModal.description}
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  {addOptionModal.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={addOptionModal.placeholder}
                  value={addOptionModal.inputValue}
                  onChange={(e) =>
                    setAddOptionModal((prev) => ({ ...prev, inputValue: e.target.value }))
                  }
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setAddOptionModal((prev) => ({ ...prev, isOpen: false, inputValue: '' }))
                  }
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#011635] hover:bg-[#022454] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Select</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: ORGANIZATIONAL HIERARCHY STRUCTURE                   */}
      {/* ============================================================== */}
      {isHierarchyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#011635] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Network className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Organizational Hierarchy Structure</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHierarchyModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <p className="text-slate-500">
                Visual corporate governance and reporting chains across executive and operational divisions:
              </p>

              {/* Hierarchy Tree Visual */}
              <div className="space-y-3">
                {/* Level 1: Executive Board */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Executive Leadership (CEO / Board)
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Tier 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-3.5">
                    Chief Executive Officer, Chief Operating Officer, Managing Director
                  </p>
                </div>

                {/* Level 2: Divisional Heads */}
                <div className="pl-4 border-l-2 border-slate-200 space-y-2.5">
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Commercial & Sales Division
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Reports to CEO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-3.5">
                      Sales Director → Sales Managers → Senior Sales Consultants → Sales Executives
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Operations, HVAC & Logistics
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Reports to COO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-3.5">
                      Operations Manager → Project Engineers → Warehouse Supervisors → Logistics Fleet
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Finance, Accounts & Procurement
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Reports to Executive
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-3.5">
                      Finance Controller → Senior Accountants → Procurement Specialists
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHierarchyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
